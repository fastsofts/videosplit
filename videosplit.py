#app.py
from flask import Flask, render_template, json, request, redirect, session, jsonify, send_file
from datetime import datetime
from pathlib import Path
import os
import uuid
import zipfile
import csv
import magic
from moviepy.editor import *
from moviepy.video.io.ffmpeg_tools import ffmpeg_extract_subclip
import moviepy
from PIL import Image
Image.LOAD_TRUNCATED_IMAGES = True
import base64
import zlib
import zipfile
import time
from proglog import ProgressBarLogger
import threading
import gc
import shutil

gc.collect()

#app = Flask(__name__)
app = Flask(__name__, template_folder='./templates', static_folder='./static')
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = -1

app.config['UPLOAD_FOLDER'] = './VUploads';
app.config['MAIN_FOLDER'] = './VFinal';

app.secret_key = str(uuid.uuid4())

vfilesadded = {}
completedstatus = 0
tobecompleted = {}
vstarttime = "00:00:00";
vendtime = "00:00:00";
statusfile = [];
threadworkers = [];


@app.route('/')
def main():
    return redirect('/Home')
     
@app.route('/Home')
def Home():
  return render_template('./videosplit.html')

@app.route('/getFiles', methods=['GET', 'POST']) 
def getFiles():
    if request.method == 'POST':
       targetpathfilesjson = os.path.join(app.config['MAIN_FOLDER'],"main.json");
       if (os.path.isfile(targetpathfilesjson)):
           jsonfile = open(targetpathfilesjson,"r+")
           jsondata = jsonfile.read()
           jsonfile.close()
           jsondata = json.loads(jsondata)
           return jsonify(jsondata)
       else:
           jsondata = []
           return jsonify(jsondata)

@app.route('/deleteFile', methods=['GET', 'POST']) 
def deleteFile():
    if request.method == 'POST':
       fileid = request.get_json(force=True)["id"]       
       targetpathfilesjson = os.path.join(app.config['MAIN_FOLDER'],"main.json")
       jsonfile = open(targetpathfilesjson,"r+")
       jsondata = jsonfile.read()
       pjsondata = json.loads(jsondata)
       try:
          if bool(jsonfile) == True:
             jsonfile.close()
       except Exception:
          pass
       newjson = []
       cdata = 0
       rpath = ""
       for data in pjsondata:
           if  pjsondata[cdata]["id"] == fileid:
               rpath = pjsondata[cdata]["splitpath"].replace("\\","/")
           else:   
               ndata = {}
               ndata["name"] = pjsondata[cdata]["name"]
               ndata["files"] = pjsondata[cdata]["files"]
               ndata["id"] = pjsondata[cdata]["id"]
               ndata["splitpath"] = pjsondata[cdata]["splitpath"]
               ndata["splitfiles"] = pjsondata[cdata]["splitfiles"]   
               newjson.append(ndata)
           cdata = cdata+1    
       nfinal = json.dumps(newjson)
       jsonfile = open(targetpathfilesjson,"w+")
       jsonfile.write(nfinal)
       jsonfile.close()
       if rpath != "":
          rpath = rpath.split("/")
          rpath = rpath[2];
          rpath = os.path.join(app.config['MAIN_FOLDER'], rpath)
          rmdir(Path(rpath)) 
       jsonreturn = {}
       jsonreturn["name"] = fileid
       jsonreturn["error"] = ""
       jsonreturn["status"] = "Removed"
       return jsonify(jsonreturn)

class BaseThread(threading.Thread):
    def __init__(self, callback=None, callback_args=None, *args, **kwargs):
        target = kwargs.pop('target')
        target_args = kwargs.pop('target_args')
        super(BaseThread, self).__init__(target=self.target_with_callback, *args, **kwargs)
        self.callback = callback
        self.method = target
        self.method_args = target_args
        self.callback_args = callback_args

    def target_with_callback(self):
        self.method(*self.method_args)
        if self.callback is not None:
            self.callback(*self.callback_args)
     


@app.route('/checkFile', methods=['GET', 'POST']) 
def checkFile():
    if request.method == 'POST':
       fileid = request.get_json(force=True)["file"]
       splitpath = request.get_json(force=True)["splitpath"]
       id = request.get_json(force=True)["id"]
       multithread = request.get_json(force=True)["multithread"]
       vfilen = os.path.join(splitpath,fileid)
       global completedstatus
       if os.path.isfile(vfilen) and completedstatus >= 100:
          global tobecompleted
          mime = magic.Magic(mime=True)
          vfilename = mime.from_file(vfilen)
          if vfilename.find('video') != -1:
             completedstatus = 0
             targetpathfilesjson = os.path.join(app.config['MAIN_FOLDER'],"main.json");             
             with open(targetpathfilesjson,"r+", encoding='utf-8', errors='ignore') as jsondata:
             #jsondata = jsonfile.read()
                  pjsondata = json.load(jsondata, strict=False)
             try:
               if bool(jsonfile) == True:
                  jsonfile.close()
             except Exception:
               pass
             newjson = [];
             cdata = 0
             for data in pjsondata:
                 ndata = {};
                 ndata["name"] = pjsondata[cdata]["name"]
                 ndata["files"] = pjsondata[cdata]["files"]
                 ndata["id"] = pjsondata[cdata]["id"]
                 ndata["splitpath"] = pjsondata[cdata]["splitpath"]
                 if (pjsondata[cdata]["id"] == id):
                     ndata["splitfiles"] = tobecompleted    
                 else:
                     ndata["splitfiles"] = pjsondata[cdata]["splitfiles"]   
                 newjson.append(ndata)
                 cdata = cdata+1     
             nfinal = json.dumps(newjson)
             jsonfile = open(targetpathfilesjson,"w+")
             jsonfile.write(nfinal)
             jsonfile.close()
             jsonreturn = {}
             jsonreturn["name"] = fileid
             jsonreturn["error"] = ""
             jsonreturn["status"] = "File created"
             jsonreturn["completed"] = completedstatus
             return jsonify(jsonreturn)
          else:
             jsonreturn = {}
             jsonreturn["name"] = fileid
             jsonreturn["error"] = ""
             jsonreturn["status"] = "File not created"
             jsonreturn["completed"] = completedstatus
             return jsonify(jsonreturn)
       else:
          jsonreturn = {}
          jsonreturn["name"] = fileid
          jsonreturn["error"] = ""
          jsonreturn["status"] = "File not created"
          jsonreturn["completed"] = completedstatus
          return jsonify(jsonreturn)



@app.route('/readFiles', methods=['GET', 'POST']) 
def readFiles():
    if request.method == 'POST':
       file = request.get_json(force=True)["files"]
       files = file.split("||")
       fileid = request.get_json(force=True)["file"]
       fileid = fileid.split("||")
       vfile = ""
       vcount = 0
       vfiles = ""
       for file in files:
           if bool(file)==False:
              continue
           if os.path.isfile(files[vcount]):
              pass
           else:
              continue
           vfile = open(files[vcount],'rb')
           vdata = vfile.read()
           vfile.close
           ndata = {};
           fdata = base64.b64encode(vdata)
           vfiles += "||99999||"+fileid[vcount]+"||9999||"+str(fdata, "utf-8")
           vcount = vcount+1
       return vfiles

@app.route('/getSplitData', methods=['GET', 'POST']) 
def getSplitData():
    if request.method == 'POST':
       id = request.get_json(force=True)["id"]
       files = request.get_json(force=True)["files"];
       global vfilesadded 
       vfilesadded = {}
       if bool(files)==False:
          jsonreturn = {}
          jsonreturn["name"] = id
          jsonreturn["files"] = vfilesadded
          jsonreturn["error"] = "No files added"
          return jsonify(jsonreturn)
       files = files.split("||");
       vfile = ""
       foundcsv = False;
       for file in files:
           if bool(file)==False:
              continue
           mime = magic.Magic(mime=True)
           vfilename = mime.from_file(file)
           if vfilename.find('video') != -1:
              vfile = file
       foundcsv = False
       for file in files:
           if bool(file)==False:
              continue
           extension = file.split(".")[2]
           if extension.upper() == "CSV":
              foundcsv = True
       if foundcsv:
          for file in files:
              if bool(file)==False:
                 continue
              extension = file.split(".")[2]
              if extension.upper() == "CSV":
                 fields = []
                 rows = []
                 with open(file, 'r' , encoding="utf8") as csvfile:
                      csvreader = csv.reader(csvfile)
                      fields = next(csvreader)
                      for row in csvreader:
                          rows.append(row)
                 nrow = 0;
                 for row in rows:  
                     getvfile(fields,nrow,rows,vfile)
                     nrow = nrow+1
                 jsonreturn = {}
                 jsonreturn["name"] = id
                 jsonreturn["error"] = ""
                 jsonreturn["filestoprocess"] = vfilesadded
                 jsonreturn["status"] = "Done"
                 return jsonify(jsonreturn)
       else:
          jsonreturn = {}
          jsonreturn["name"] = id
          jsonreturn["error"] = "Link file not found"
          jsonreturn["status"] = "Link file not found"
          jsonreturn["filestoprocess"] = {}
          return jsonify(jsonreturn)


@app.route('/splitFiles', methods=['GET', 'POST']) 
def splitFiles():
    if request.method == 'POST':
       codecs = {};
       codecs["MOV"] = "libx264";
       codecs["MP4"] = "libx264";
       codecs["AVI"] = "rawvideo";
       codecs["OGV"] = "libvorbis"
       codecs["WEBM"] = "libvpx";
       id = request.get_json(force=True)["id"]
       files = request.get_json(force=True)["files"]
       selectedfile = request.get_json(force=True)["sefile"]
       offsettime = request.get_json(force=True)["offsettime"]
       prerolltime = request.get_json(force=True)["prerolltime"]
       postrolltime = request.get_json(force=True)["postrolltime"]
       symbol = request.get_json(force=True)["symbol"] 
       counter = request.get_json(force=True)["counter"] 
       ended = request.get_json(force=True)["ended"]
       start = request.get_json(force=True)["vstart"] 
       end = request.get_json(force=True)["vend"] 
       multithread = request.get_json(force=True)["multithread"] 
       global tobecompleted
       tobecompleted = request.get_json(force=True)["tobecompleted"]
       if multithread == 0:
          data = selectedfile["data"]
          fid = selectedfile["id"]
          fields = selectedfile["data"]["genheader"]
          global vfilesadded 
          vfilesadded = {}
          splitpath = request.get_json(force=True)["splitpath"]
          if bool(files)==False:
             jsonreturn = {}
             jsonreturn["name"] = id
             jsonreturn["error"] = "No files selected"
             return jsonify(jsonreturn)
          foundcsv = False
          files = files.split("||");
          fileid = ""
          vfile = ""
          for file in files:
              if bool(file)==False:
                 continue
              mime = magic.Magic(mime=True)
              vfilename = mime.from_file(file)
              if vfilename.find('video') != -1:
                 vfile = file
          if bool(vfile)==False:
             jsonreturn = {}
             jsonreturn["name"] = id
             jsonreturn["error"] = "No files selected"
             return jsonify(jsonreturn)
          mp = moviepy.editor
          video=mp.VideoFileClip(vfile)
          maxduration = video.duration;
          video.close()
          del video
          gc.collect()
          outofrange = 0
          countera = 0
          startTime = data["vst"]
          endTime = data["vent"]
          startTime = startTime.split(":")
          endTime = endTime.split(":")
          stTime = 0;
          stTime = int(startTime[0]) * 60 * 60
          stTime = stTime + int(startTime[1]) * 60
          stTime = stTime + int(startTime[2])
          enTime = 0;
          enTime = int(endTime[0]) * 60 * 60
          enTime = enTime + int(endTime[1]) * 60
          enTime = enTime + int(endTime[2])
          print("Original Start Time - "+str(stTime))
          print("Original End Time - "+str(stTime))
          print("Symbol - "+symbol)
          print("Preroll - "+prerolltime)
          print("Postroll - "+postrolltime)
          print("offset - "+offsettime)
          if bool(prerolltime) == True: 
             if counter == 0:
                prerollTime =  prerolltime.split(":")
                stTime = stTime - int(prerollTime[0]) * 60 * 60
                stTime = stTime - int(prerollTime[1]) * 60
                stTime = stTime - int(prerollTime[2]) 
          if bool(postrolltime) == True: 
             if ended == 1:
                postrollTime =  postrolltime.split(":")
                enTime = enTime + int(postrollTime[0]) * 60 * 60
                enTime = enTime + int(postrollTime[1]) * 60
                enTime = enTime + int(postrollTime[2]) 
          if bool(offsettime) == True:
             offsetTime =  offsettime.split(":")   
             if symbol == "+":
                stTime = stTime + int(offsetTime[0]) * 60 * 60
                stTime = stTime + int(offsetTime[1]) * 60
                stTime = stTime + int(offsetTime[2])  
                enTime = enTime + int(offsetTime[0]) * 60 * 60
                enTime = enTime + int(offsetTime[1]) * 6
                enTime = enTime + int(offsetTime[2]) 
             if symbol == "-":
                stTime = stTime - int(offsetTime[0]) * 60 * 60
                stTime = stTime - int(offsetTime[1]) * 60
                stTime = stTime - int(offsetTime[2])  
                enTime = enTime - int(offsetTime[0]) * 60 * 60
                enTime = enTime - int(offsetTime[1]) * 60                     
                enTime = enTime - int(offsetTime[2]) 
          if stTime < 0:
             outofrange = 1
          if enTime >  maxduration:
             outofrange = 1
          if outofrange == 1:
             jsonreturn = {}
             jsonreturn["name"] = ""
             jsonreturn["error"] = "Start or end Time is out of range"
             jsonreturn["status"] = ""
             jsonreturn["filetobeadded"] = ""
             return jsonify(jsonreturn)
          fileid = fid
          status = videoprocess(fields,ended,counter,data,vfile,splitpath,codecs,fileid,id,symbol,offsettime,prerolltime,postrolltime,start,end)
          jsonreturn = {}
          jsonreturn["name"] = id
          jsonreturn["error"] = ""
          jsonreturn["status"] = "Started"
          jsonreturn["filetobeadded"] = fileid
          return jsonify(jsonreturn)
       else:
          foundcsv = False
          files = files.split("||");
          fileid = ""
          vfile = ""
          for file in files:
              if bool(file)==False:
                 continue
              mime = magic.Magic(mime=True)
              vfilename = mime.from_file(file)
              if vfilename.find('video') != -1:
                 vfile = file
          if bool(vfile)==False:
             jsonreturn = {}
             jsonreturn["name"] = ""
             jsonreturn["error"] = "No files processed"
             return jsonify(jsonreturn)
          mp = moviepy.editor
          video=mp.VideoFileClip(vfile)
          maxduration = video.duration;
          video.close()
          del video
          gc.collect()
          outofrange = 0
          countera = 0
          for sfile in selectedfile:
              data = sfile["data"] 
              startTime = data["vst"]
              endTime = data["vent"]
              startTime = startTime.split(":")
              endTime = endTime.split(":")
              stTime = 0;
              stTime = int(startTime[0]) * 60 * 60
              stTime = stTime + int(startTime[1]) * 60
              stTime = stTime + int(startTime[2])
              enTime = 0;
              enTime = int(endTime[0]) * 60 * 60
              enTime = enTime + int(endTime[1]) * 60
              enTime = enTime + int(endTime[2])
              print("Original Start Time - "+str(stTime))
              print("Original End Time - "+str(stTime))
              print("Symbol - "+symbol)
              print("Preroll - "+prerolltime)
              print("Postroll - "+postrolltime)
              print("offset - "+offsettime)
              if bool(prerolltime) == True: 
                 if (counter == 0 and countera == 0):
                     prerollTime =  prerolltime.split(":")
                     stTime = stTime - int(prerollTime[0]) * 60 * 60
                     stTime = stTime - int(prerollTime[1]) * 60
                     stTime = stTime - int(prerollTime[2]) 
              if bool(postrolltime) == True: 
                 if (ended == 1):
                     postrollTime =  postrolltime.split(":")
                     enTime = enTime + int(postrollTime[0]) * 60 * 60
                     enTime = enTime + int(postrollTime[1]) * 60
                     enTime = enTime + int(postrollTime[2]) 
              if bool(offsettime) == True:
                 offsetTime =  offsettime.split(":")   
                 if symbol == "+":
                    stTime = stTime + int(offsetTime[0]) * 60 * 60
                    stTime = stTime + int(offsetTime[1]) * 60
                    stTime = stTime + int(offsetTime[2])  
                    enTime = enTime + int(offsetTime[0]) * 60 * 60
                    enTime = enTime + int(offsetTime[1]) * 6
                    enTime = enTime + int(offsetTime[2]) 
                 if symbol == "-":
                    stTime = stTime - int(offsetTime[0]) * 60 * 60
                    stTime = stTime - int(offsetTime[1]) * 60
                    stTime = stTime - int(offsetTime[2])  
                    enTime = enTime - int(offsetTime[0]) * 60 * 60
                    enTime = enTime - int(offsetTime[1]) * 60                     
                    enTime = enTime - int(offsetTime[2]) 
              if stTime < 0:
                 outofrange = 1
              if enTime >  maxduration:
                 outofrange = 1
              countera = countera + 1
          if outofrange == 1:
             jsonreturn = {}
             jsonreturn["name"] = ""
             jsonreturn["error"] = "Start or end Time is out of range"
             jsonreturn["status"] = ""
             jsonreturn["filetobeadded"] = ""
             return jsonify(jsonreturn)
          global threadworkers
          for thread in threadworkers:
              thread.killed = True
          threadworkers = [];
          countera = 0
          for sfile in selectedfile:
              data = sfile["data"]
              fid = sfile["id"]
              fields = sfile["data"]["genheader"]   
              splitpath = request.get_json(force=True)["splitpath"]
              fileid = fid;
              args = (fields,ended,counter,data,vfile,splitpath,codecs,fileid,id,symbol,offsettime,prerolltime,postrolltime,start,end,countera)
              thread = BaseThread(name=fileid,target=videoprocessmulti,callback=moviecomplete,callback_args=(fileid, data),target_args=args)
              thread.start()
              threadworkers.append(thread);
              countera = countera + 1
          for thread in threadworkers:
              thread.join()
          jsonreturn = {}
          jsonreturn["name"] = ""
          jsonreturn["error"] = ""
          jsonreturn["status"] = "Started"
          jsonreturn["filetobeadded"] = ""
          return jsonify(jsonreturn)

@app.route('/getstatusFile', methods=['GET', 'POST']) 
def getstatusFile():
    if request.method == 'POST':
       global statusfile
       jsonreturn = {}
       jsonreturn["status"] = statusfile
       statusfile = []
       return jsonify(jsonreturn)
       
def moviecomplete(param1, param2):
    global statusfile
    statusfile.append(param1);

@app.route('/upload', methods=['GET', 'POST']) 
def upload():
    if request.method == 'POST':
        codecs = {};
        codecs["MOV"] = "libx264";
        codecs["MP4"] = "libx264";
        codecs["AVI"] = "rawvideo";
        codecs["OGV"] = "libvorbis"
        codecs["WEBM"] = "libvpx";
        file = request.files['files[]']
        wfile = file.filename
        #f_name = str(uuid.uuid4()) + extension
        tempfolder = "t_"+str(uuid.uuid4())
        temppath = os.path.join(app.config['UPLOAD_FOLDER'], tempfolder)
        os.makedirs(temppath)
        os.chmod(temppath, 0o0777)
        tempfile = os.path.join(temppath, wfile)
        file.save(tempfile)
        path = os.path.join(temppath, "temp")
        os.makedirs(path)
        os.chmod(path, 0o0777)
        with zipfile.ZipFile(tempfile,"r") as zip_ref:
             zip_ref.extractall(path)
        fileslist = []
        for subdir, dirs, files in os.walk(path):
            for file in files:
                fileslist.append(os.path.join(subdir, file))
        isvideo = False
        isvalidcsv = False
        for files in fileslist:
            extension = os.path.splitext(files)[1]
            if bool(extension)==False:
                continue
            if extension.upper() == ".CSV":
               pass
            else:
                if extension[1:].upper() in codecs:
                    pass
                else:
                    continue
                mime = magic.Magic(mime=True)
                vfilename = mime.from_file(files)
                if vfilename.find('video') != -1:
                   isvideo = True;
                continue
            fields = []
            rows = []
            with open(files, 'r', encoding="utf8") as csvfile:
                csvreader = csv.reader(csvfile)
                fields = next(csvreader)
                for row in csvreader:
                    rows.append(row)
            isvalidcs = 0
            for field in fields:
                if field.upper() == "VIDEO RECORDING":
                   isvalidcs = isvalidcs+1
                if field.upper() == "STARTED (ELAPSED)":
                   isvalidcs = isvalidcs+1
                if field.upper() == "ENDED (ELAPSED)":
                   isvalidcs = isvalidcs+1
                if field.upper() == "STARTED FULFILLMENT(TIME ELAPSED)":
                   isvalidcs = isvalidcs+1
                if field.upper() == "ENDED FULFILLMENT(TIME ELAPSED)":
                   isvalidcs = isvalidcs+1
                if field.upper() == "STARTED FULFILLMENT (TIME ELAPSED)":
                   isvalidcs = isvalidcs+1
                if field.upper() == "ENDED FULFILLMENT (TIME ELAPSED)":
                   isvalidcs = isvalidcs+1
                if field.upper() == "ORDER NUMBER":
                   isvalidcs = isvalidcs+1
                if field.upper() == "QUEUE NUMBER":
                   isvalidcs = isvalidcs+1
            if isvalidcs == 5:
               isvalidcsv = True 
        jsonreturn = {};
        print(isvalidcsv)
        if isvalidcsv==False:
           jsonreturn["name"] = wfile
           jsonreturn["error"] = "Cannot able to upload as the structure of the csv is not compatible"
           rmdir(Path(temppath))
           return jsonify(jsonreturn)
        else:
           targetpath = os.path.join(app.config['MAIN_FOLDER'], str(uuid.uuid4()))
           os.makedirs(targetpath) 
           os.chmod(targetpath, 0o0777)
           targetpathfiles = os.path.join(targetpath,"files");
           os.makedirs(targetpathfiles) 
           os.chmod(targetpathfiles, 0o0777)
           targetpathsplits = os.path.join(targetpath,"splits");
           os.makedirs(targetpathsplits) 
           os.chmod(targetpathfiles, 0o0777)
           targetpathfilesjson = os.path.join(app.config['MAIN_FOLDER'],"main.json");
           targetfiles = ""
           for files in fileslist:
               extension = os.path.splitext(files)[1]
               if bool(extension)==False:
                  continue
               targetfile = os.path.join(targetpathfiles, str(uuid.uuid4())+extension)
               sourcefile = files
               targetfiles = targetfiles + "||" + targetfile
               #with open(sourcefile, 'rb') as src, open(targetfile, 'wb') as dst: dst.write(src.read())
               shutil.copyfile(sourcefile,targetfile)
           if (os.path.isfile(targetpathfilesjson)):
               jsonfile = open(targetpathfilesjson,"r+", encoding='utf-8', errors='ignore')
               jsondata = jsonfile.read()
               if bool(jsondata)==False:
                  newjson = [];
                  ndata = {};
                  ndata["name"] = os.path.splitext(wfile)[0]
                  ndata["files"] = targetfiles
                  ndata["id"] = str(uuid.uuid4())
                  ndata["splitpath"] = targetpathsplits
                  ndata["splitfiles"] = {}
                  newjson.append(ndata)
                  nfinal = json.dumps(newjson)
               else:
                  pjsondata = json.loads(jsondata, strict=False)
                  newjson = [];
                  dcount = 0
                  for data in pjsondata:
                      ndata = {};
                      ndata["name"] = pjsondata[dcount]["name"]
                      ndata["files"] = pjsondata[dcount]["files"]
                      ndata["id"] = pjsondata[dcount]["id"]
                      ndata["splitpath"] = pjsondata[dcount]["splitpath"]
                      ndata["splitfiles"] = pjsondata[dcount]["splitfiles"]
                      newjson.append(ndata)
                      dcount = dcount + 1
                  ndata = {}
                  ndata["name"] = os.path.splitext(wfile)[0]
                  ndata["files"] = targetfiles
                  ndata["id"] = str(uuid.uuid4())
                  ndata["splitpath"] = targetpathsplits
                  ndata["splitfiles"] = {}
                  newjson.append(ndata)
                  nfinal = json.dumps(newjson)
               jsonfile.close()
               jsonfile = open(targetpathfilesjson,"w+")
               jsonfile.write(nfinal)
               jsonfile.close()
           else:
               newjson = [];
               jsonfile = open(targetpathfilesjson,"w+")
               ndata = {};
               ndata["name"] = os.path.splitext(wfile)[0]
               ndata["files"] = targetfiles
               ndata["id"] = str(uuid.uuid4())
               ndata["splitpath"] = targetpathsplits
               ndata["splitfiles"] = {}
               newjson.append(ndata)
               nfinal = json.dumps(newjson)
               jsonfile.write(nfinal)
               jsonfile.close()
           jsonreturn["name"] = wfile
           jsonreturn["error"] = "" 
           rmdir(Path(temppath)) 
           return jsonify(jsonreturn)

def getvfile(fields,nrow,rows,vfile):
    fileid = ""
    global vfilesadded
    global vstarttime
    global vendtime
    headercount = 0
    vst = "00:00:00"
    vent = "00:00:00" 
    for header in fields:
        if header.upper() == "ORDER NUMBER":
           fileid = fileid + "_" + rows[nrow][headercount]
        if header.upper() == "QUEUE NUMBER":
           fileid = fileid + "_" + rows[nrow][headercount]
        if header.upper() == "STARTED FULFILLMENT(TIME ELAPSED)":
           vst = rows[nrow][headercount]
           if (bool(vstarttime) == False):
               vstarttime = rows[nrow][headercount]
        if header.upper() == "ENDED FULFILLMENT(TIME ELAPSED)":
           vent = rows[nrow][headercount]
           if bool(rows[nrow][headercount]) == True:
              vendtime = rows[nrow][headercount]
        if header.upper() == "STARTED FULFILLMENT (TIME ELAPSED)":
           vst = rows[nrow][headercount]
           if (bool(vstarttime) == False):
               vstarttime = rows[nrow][headercount]
        if header.upper() == "ENDED FULFILLMENT (TIME ELAPSED)":
           vent = rows[nrow][headercount]
           if bool(rows[nrow][headercount]) == True:
              vendtime = rows[nrow][headercount]
        if header.upper() == "STARTED (ELAPSED)":
           vst = rows[nrow][headercount]
           if (bool(vstarttime) == False):
               vstarttime = rows[nrow][headercount]
        if header.upper() == "ENDED (ELAPSED)":
           vent = rows[nrow][headercount]
           if bool(rows[nrow][headercount]) == True:
              vendtime = rows[nrow][headercount]
        headercount = headercount+1
    jsondt = {}
    headercount = 0
    for header in fields:  
        jsondt[header] = rows[nrow][headercount]; 
        headercount = headercount + 1   
    jsondt["genheader"] = fields
    jsondt["timestart"] = vstarttime
    jsondt["timeend"] = vendtime
    jsondt["vst"] = vst
    jsondt["vent"] = vent
    fileid = fileid[1:len(fileid)]
    vextension = vfile.split(".")[2]
    vfilenfinal = fileid + "." + vextension
    cfilenfinal = vfilenfinal
    vfilesadded[str(nrow) + "-" + cfilenfinal] = jsondt

def videoprocessmulti(fields,ended,counter,vdata,vfile,splitpath,codecs,fileid,id,symbol,offsettime,prerolltime,postrolltime,start,end,countera):
    fileid = fileid.split(".")[0]
    global vfilesadded
    headercount = 0
    startTime = "00:00:00"
    endTime = "00:00:00"
    header1 = ""
    header2 = ""
    for header in fields:
        if header.upper() == "STARTED (ELAPSED)":
           header1 = header
        if header.upper() == "ENDED (ELAPSED)":
           header2 = header
        if header.upper() == "STARTED FULFILLMENT (ELAPSED)":
           header1 = header
        if header.upper() == "ENDED FULFILLMENT (ELAPSED)":
           header2 = header
        if header.upper() == "STARTED FULFILLMENT (TIME ELAPSED)":
           header1 = header
        if header.upper() == "ENDED FULFILLMENT (TIME ELAPSED)":
           header2 = header
        if header.upper() == "STARTED FULFILLMENT(TIME ELAPSED)":
           header1 = header
        if header.upper() == "ENDED FULFILLMENT(TIME ELAPSED)":
           header2 = header
        headercount = headercount + 1
    startTime = vdata[header1]
    endTime = vdata[header2]
    startTime = startTime.split(":")
    endTime = endTime.split(":")
    stTime = 0;
    stTime = int(startTime[0]) * 60 * 60
    stTime = stTime + int(startTime[1]) * 60
    stTime = stTime + int(startTime[2])
    enTime = 0;
    enTime = int(endTime[0]) * 60 * 60
    enTime = enTime + int(endTime[1]) * 60
    enTime = enTime + int(endTime[2])
    print("Original Start Time - "+str(stTime))
    print("Original End Time - "+str(stTime))
    print("Symbol - "+symbol)
    print("Preroll - "+prerolltime)
    print("Postroll - "+postrolltime)
    print("offset - "+offsettime)
    if bool(prerolltime) == True: 
       if (counter == 0 and countera == 0):
           prerollTime =  prerolltime.split(":")
           stTime = stTime - int(prerollTime[0]) * 60 * 60
           stTime = stTime - int(prerollTime[1]) * 60
           stTime = stTime - int(prerollTime[2])  
    if bool(postrolltime) == True: 
       if (ended == 1):
           postrollTime =  postrolltime.split(":")
           enTime = enTime + int(postrollTime[0]) * 60 * 60
           enTime = enTime + int(postrollTime[1]) * 60
           enTime = enTime + int(postrollTime[2]) 
    if bool(offsettime) == True:
       offsetTime =  offsettime.split(":")   
       if (symbol == "+"):
           stTime = stTime + int(offsetTime[0]) * 60 * 60
           stTime = stTime + int(offsetTime[1]) * 60
           stTime = stTime + int(offsetTime[2])  
           enTime = enTime + int(offsetTime[0]) * 60 * 60
           enTime = enTime + int(offsetTime[1]) * 60
           enTime = enTime + int(offsetTime[2]) 
       if (symbol == "-"):
           stTime = stTime - int(offsetTime[0]) * 60 * 60
           stTime = stTime - int(offsetTime[1]) * 60
           stTime = stTime - int(offsetTime[2])  
           enTime = enTime - int(offsetTime[0]) * 60 * 60
           enTime = enTime - int(offsetTime[1]) * 60
           enTime = enTime - int(offsetTime[2])
    print("New Start Time - "+str(stTime))
    print("New End Time - "+str(enTime))
    vextension = vfile.split(".")[2]
    vfilen = fileid + "_1." + vextension
    vfilenfinal = fileid + "." + vextension
    cfilenfinal = vfilenfinal
    vfilen = os.path.join(splitpath,vfilen)
    vfilenfinal = os.path.join(splitpath,vfilenfinal)
    if os.path.isfile(vfilenfinal):
       os.unlink(vfilenfinal)
    ffmpeg_extract_subclip(vfile, stTime, enTime, targetname=vfilen)
    mp = moviepy.editor
    video=mp.VideoFileClip(vfilen)
    vclip = video.subclip(0, 10)
    vwidth = vclip.w
    vheight = vclip.h
    basewidth = 0
    if vwidth < vheight:
       basewidth = vwidth
    else:
       basewidth = vheight
    paddingLeft = 50
    paddingTop = 120
    paddingRight = 50
    paddingBottom = 100
    img = Image.open("./watermark/watermark.png")
    wpercent = (basewidth/float(img.size[0]))
    wwidth = round(img.size[0]*0.1)
    wheight = round(img.size[1]*0.1)
    wht = float(img.size[0]/2)
    #hsize = int((wht*float(wpercent)))
    hsize = int((float(img.size[1])*float(wpercent)))
    #img = img.resize((basewidth,hsize), Image.ANTIALIAS)
    img.thumbnail((round(wwidth), round(wheight)), Image.ANTIALIAS)
    watermakersplit = os.path.join(splitpath,"watermark.png")
    img.save(watermakersplit)
    basewidth = basewidth 
    hsize = hsize - paddingTop - paddingBottom
    watermark = (mp.ImageClip(watermakersplit)
                   .set_duration(video.duration)
                   .resize(width=round(wwidth),height=round(wheight))
                   .margin(left=paddingLeft, top=vheight-paddingBottom, opacity=.01)
                   .set_pos('right','bottom'))
    watermarked = mp.CompositeVideoClip([video,watermark])
    watermarked.subclip(0).write_videofile(vfilenfinal,codec=codecs[vfile.split(".")[2].upper()], logger=my_logger)            
    vfilesadded[cfilenfinal] = 1
    video.close
    del video
    gc.collect()
    os.remove(vfilen)
    return True




def videoprocess(fields,ended,counter,vdata,vfile,splitpath,codecs,fileid,id,symbol,offsettime,prerolltime,postrolltime,start,end):
    fileid = fileid.split(".")[0]
    global vfilesadded
    headercount = 0
    startTime = "00:00:00"
    endTime = "00:00:00"
    header1 = ""
    header2 = ""
    for header in fields:
        if header.upper() == "STARTED (ELAPSED)":
           header1 = header
        if header.upper() == "ENDED (ELAPSED)":
           header2 = header
        if header.upper() == "STARTED FULFILLMENT (TIME ELAPSED)":
           header1 = header
        if header.upper() == "ENDED FULFILLMENT (TIME ELAPSED)":
           header2 = header
        if header.upper() == "STARTED FULFILLMENT(TIME ELAPSED)":
           header1 = header
        if header.upper() == "ENDED FULFILLMENT(TIME ELAPSED)":
           header2 = header
        headercount = headercount + 1
    startTime = vdata[header1]
    endTime = vdata[header2]
    startTime = startTime.split(":")
    endTime = endTime.split(":")
    stTime = 0;
    stTime = int(startTime[0]) * 60 * 60
    stTime = stTime + int(startTime[1]) * 60
    stTime = stTime + int(startTime[2])
    enTime = 0;
    enTime = int(endTime[0]) * 60 * 60
    enTime = enTime + int(endTime[1]) * 60
    enTime = enTime + int(endTime[2])
    print("Original Start Time - "+str(stTime))
    print("Original End Time - "+str(stTime))
    print("Symbol - "+symbol)
    print("Preroll - "+prerolltime)
    print("Postroll - "+postrolltime)
    print("offset - "+offsettime)
    if bool(prerolltime) == True: 
       if (counter == 0):
           prerollTime =  prerolltime.split(":")
           stTime = stTime - int(prerollTime[0]) * 60 * 60
           stTime = stTime - int(prerollTime[1]) * 60
           stTime = stTime - int(prerollTime[2])  
    if bool(postrolltime) == True: 
       if (ended == 1):
           postrollTime =  postrolltime.split(":")
           enTime = enTime + int(postrollTime[0]) * 60 * 60
           enTime = enTime + int(postrollTime[1]) * 60
           enTime = enTime + int(postrollTime[2]) 
    if bool(offsettime) == True:
       offsetTime =  offsettime.split(":")   
       if (symbol == "+"):
           stTime = stTime + int(offsetTime[0]) * 60 * 60
           stTime = stTime + int(offsetTime[1]) * 60
           stTime = stTime + int(offsetTime[2])  
           enTime = enTime + int(offsetTime[0]) * 60 * 60
           enTime = enTime + int(offsetTime[1]) * 60
           enTime = enTime + int(offsetTime[2]) 
       if (symbol == "-"):
           stTime = stTime - int(offsetTime[0]) * 60 * 60
           stTime = stTime - int(offsetTime[1]) * 60
           stTime = stTime - int(offsetTime[2])  
           enTime = enTime - int(offsetTime[0]) * 60 * 60
           enTime = enTime - int(offsetTime[1]) * 60
           enTime = enTime - int(offsetTime[2]) 
    print("New Start Time - "+str(stTime))
    print("New End Time - "+str(stTime))
    vextension = vfile.split(".")[2]
    vfilen = fileid + "_1." + vextension
    vfilenfinal = fileid + "." + vextension
    cfilenfinal = vfilenfinal
    vfilen = os.path.join(splitpath,vfilen)
    vfilenfinal = os.path.join(splitpath,vfilenfinal)
    if os.path.isfile(vfilenfinal):
       os.unlink(vfilenfinal)
    ffmpeg_extract_subclip(vfile, stTime, enTime, targetname=vfilen)
    mp = moviepy.editor
    video=mp.VideoFileClip(vfilen)
    vclip = video.subclip(0, 10)
    vwidth = vclip.w
    vheight = vclip.h
    basewidth = 0
    if vwidth < vheight:
       basewidth = vwidth
    else:
       basewidth = vheight
    paddingLeft = 50
    paddingTop = 120
    paddingRight = 50
    paddingBottom = 100
    img = Image.open("./watermark/watermark.png")
    wpercent = (basewidth/float(img.size[0]))
    wwidth = round(img.size[0]*0.1)
    wheight = round(img.size[1]*0.1)
    wht = float(img.size[0]/2)
    #hsize = int((wht*float(wpercent)))
    hsize = int((float(img.size[1])*float(wpercent)))
    #img = img.resize((basewidth,hsize), Image.ANTIALIAS)
    img.thumbnail((round(wwidth), round(wheight)), Image.ANTIALIAS)
    watermakersplit = os.path.join(splitpath,"watermark.png")
    img.save(watermakersplit)
    basewidth = basewidth 
    hsize = hsize - paddingTop - paddingBottom
    watermark = (mp.ImageClip(watermakersplit)
                   .set_duration(video.duration)
                   .resize(width=round(wwidth),height=round(wheight))
                   .margin(left=paddingLeft, top=vheight-paddingBottom, opacity=.01)
                   .set_pos('right','bottom'))
    watermarked = mp.CompositeVideoClip([video,watermark])
    watermarked.subclip(0).write_videofile(vfilenfinal,codec=codecs[vfile.split(".")[2].upper()], logger=my_logger)            
    vfilesadded[cfilenfinal] = 1
    del video
    gc.collect()
    os.remove(vfilen)
    return True


@app.route('/downloadZip', methods=['GET', 'POST']) 
def downloadZip():
    return send_file(session['zipfile'], as_attachment=True)

@app.route('/zipFiles', methods=['GET', 'POST']) 
def zipFiles():
    if request.method == 'POST':
       files = request.get_json(force=True)["sfile"]
       sfile = files.split("||")
       tfile = request.get_json(force=True)["tfile"]
       spath = request.get_json(force=True)["splitpath"]
       zippfile = os.path.join(spath,tfile + ".zip")
       compression = zipfile.ZIP_DEFLATED
       zf = zipfile.ZipFile(zippfile,"w")
       try:
          scount = 0
          for file in sfile:
            zipsfile = os.path.join(spath,sfile[scount])
            zf.write(zipsfile, sfile[scount], compress_type=compression)
            scount = scount+1
       except FileNotFoundError:
          jsonreturn = {}
          jsonreturn["file"] = ""
          jsonreturn["error"] = "Error cannot able to download"
          return jsonify(jsonreturn)
       finally: 
          zf.close()
          jsonreturn = {}
          jsonreturn["file"] = zippfile
          jsonreturn["error"] = ""
          session['zipfile'] = zippfile 
          return jsonify(jsonreturn)


def rmdir(directory):
    directory = Path(directory)
    for item in directory.iterdir():
        if item.is_dir():
            rmdir(item)
        else:
            item.unlink()
    directory.rmdir()

class MyBarLogger(ProgressBarLogger):
    def callback(self, **changes):
        # Every time the logger message is updated, this function is called with
        # the `changes` dictionary of the form `parameter: new value`.
        for (parameter, value) in changes.items():
            print ('Parameter %s is now %s' % (parameter, value))
    def bars_callback(self, bar, attr, value,old_value=None):
        # Every time the logger progress is updated, this function is called        
        percentage = (value / self.bars[bar]['total']) * 100
        #print(percentage)
        global completedstatus
        completedstatus = percentage;

my_logger = MyBarLogger()

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,debug=True)

