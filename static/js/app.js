gdata = null;
$("#vfiles").selectpicker();
$("#vsplits").selectpicker();
width = window.innerWidth;
height = window.innerHeight;
$("#wrapper").css("width",width+"px");
$("#wrapper").css("height",height+"px");

$(".loadingtext").css("display","none");
$(".loadingtext1").css("display","none");
$(".loading").css("display","none");
previewclicked = false;
html = '<div style = "display:none;"><div id="files" class="files" style="overflow-x:auto;overflow-y:auto;height:300px;">'
html += '<table style = "width:100%;display:none;" border = "1" id="filesholder" class="files"><th></th><th>Name</th><th>Linked to</th><th>Size</th><th></th></table>'
html += '</div></div>'
$("body").append(html);
$("#videos").css("height",(height-$("#optionsholder").height()-80)+"px");  
$("#vcards").css("height",((height-$("#optionsholder").height()) )+"px");

$("#watermark").css("top",((height - $("#watermark").height())/2) + "px");

$('input[id$="offset"]').inputmask(
  "hh:mm:ss", {
  placeholder: "HH:MM:SS", 
  insertMode: false,
  allowPlus: true,
  allowMinus: true
})

$('input[id$="preroll"]').inputmask(
  "hh:mm:ss", {
  placeholder: "HH:MM:SS", 
  insertMode: false,
  allowPlus: true,
  allowMinus: true
})

$('input[id$="postroll"]').inputmask(
  "hh:mm:ss", {
  placeholder: "HH:MM:SS", 
  insertMode: false,
  allowPlus: true,
  allowMinus: true
})




__filetypesallowedtypefile = "zip|";
__filetypesallowedfile = "application/x-zip-compressed|";
__maxfilesizeupload = 100000000;
var removedfiles = [];
var  selectedforuploads = [];
var _initknt = 0;
var _totalfiles = 1;
var selectedfilenames = [];
var confirmation_yes = false;
var confirmation_no = false; 
var filesizes = [];
var filesuploaded = false;
var uploadedfilename = [];
var eventprogress = false;
var processfiles = [];
var filecount = 0;
var imagecount = 0;
downloadinprocess = false;
multithreadcounter = 10;
filesprocessed = [];
filescompleted = [];

var  __fileupload = false;

function fileuploads()
 {
//$(function () {
  try{  
      'use strict';
       var url = "./upload";
       $(window).ondragleave = function(){ 
           $("#upload_button").css("border-color","rgba(0,0,0,1)");
       };
       $("#wrapper").fileupload({
          url: url,
          dataType: 'json',
          autoUpload: false,
//          maxNumberOfFiles: 1,
          limitMultiFileUploads : 1,
//          acceptFileTypes: /(\.|\/)(json)$/i,
          maxFileSize: __maxfilesizeupload, 
          // Enable image resizing, except for Android and Opera,
          // which actually support image resizing, but fail to
          // send Blob objects via XHR requests:
          disableImageResize : true,
//          disableImageResize: /Android(?!.*Chrome)|Opera/
//           .test(window.navigator && navigator.userAgent),
          previewMaxWidth: 0,
          previewMaxHeight: 0,
          previewCrop: false 
        }).on("fileuploaddragover",function(e,data){ 
           $("#upload_button").css("border-color","rgba(0,0,0,.2)");
        }).on("dragleave",function(){
           $("#tree-container").css("background-color"," ");
        }).on("drop",function(e,data){ 
        }).on('fileuploadadd', function (e, data) {  
          if ($("#filesholder").length == 0)
             {
              wid = $("#files").width();
              $("#files").html('<table border = "1" style = "width:'+wid+'px'+';display:none;" id="filesholder" class="files"><th></th><th>Name</th><th>Linked to</th><th>Size</th><th></th></table>');
             } 
          if (selectedforuploads.length != 0 && filesuploaded)
             {
              confirmation_yes = false;
              confirmation_no = false;
              alertbox("",4,"Already selected files are waiting for upload. Do you want to overwrite (Yes/No)","resetvalues()","")
              if (confirmation_no)
                 {
                  return;
                 }   
              if (confirmation_yes)
                 {
                  return;
                 }   
             } 
          _initknt++; 
          if ($("#upload").length == 0)
              {   
               $("#files").prepend('<button id = "upload" rel = "upload" class = "btn btn-primary btn-responsive">Upload</button>');
              }
           else
              { 
               $("#upload").show();
              }    
//              uploadedfilename=[];
           if (_initknt > _totalfiles)
              {
               _initknt = _totalfiles;
               return;
              } 
//          var imgurl = URL.createObjectURL(data.files[0]);
          imgurl = "css/images/fileimage.png?t="+Math.random();
          $.each(data.files, function (index, file) { 
             ftype = file.type; 
             if (!ftype)
                {
                 ft = __filetypesallowedfile+"|";
                 ftype = file.name.split("."); 
                 ftype = ftype[1]; 
                 if (ft.toUpperCase().indexOf(ftype.toUpperCase()+"|") < 0)
                    {
                     $(".bootbox").remove();
                     $(".modal-backdrop").remove();                   
                     if (_initknt > 0)
                        {
                         $("#upload").remove();  
                         alertbox("File of this type are not allowed.",1,"Error !!!","");
                        }
                     _initknt--;  
                     return;
                    }                            
                } 
             else
                {  
                 ft = __filetypesallowedfile+"|";
                 if (ft.indexOf(ftype+"|") < 0)
                    { 
                     $(".bootbox").remove();
                     $(".modal-backdrop").remove();                   
                     if (_initknt > 0)
                        {
                         $("#upload").remove();  
                         alertbox("File of this type are not allowed.",1,"Error !!!","");
                        }
                     _initknt--;  
                     return;
                    }
                }      
             var fileax1 = __filetypesallowedfile.split("|");
             var fileax2 = __filetypesallowedtypefile.split("|");
             actualfiletype = '';   
             for (var fxx = 0; fxx < fileax1.length; fxx++)
                 {
                  if (fileax1[fxx].toUpperCase() == ftype.toUpperCase())
                     {
                      actualfiletype = fileax2[fxx];
                      break; 
                     }
                 } 
             var filefound = false; 
             for (var isel = 0; isel < selectedfilenames.length; isel++)
                 { 
                  if (selectedfilenames[isel].file.toUpperCase() == file.name.toUpperCase())
                     {
                      filefound = true;
                      break;
                     }
                }   
             if (filefound)
                {
                 _initknt--;  
                 return;
                } 
             if (_initknt == 1)
                {   
                 selectedforuploads  = [];
                 selectedfilenames = [];
                 selectedfiletypes = [];
                 var htm = "<td rel = '" + "r" + _initknt +  "' style = 'min-width:25%'>"  + "<img style = 'width:75px;height:75px;padding:5px;' src = '" + imgurl + "'>"  + "</td><td rel = '" + "r" + _initknt +  "' style = 'min-width:25%;padding:2px;'>"  + file.name + "</td><td rel = '" + "r" + _initknt + "' style = 'min-width:25%;padding:2px;'>" +  ftype + "</td><td rel = '" + "r" + _initknt + "' style = 'min-width:25%;text-align:right;;padding:2px;'>" + Math.round((file.size/1024) * 100) / 100 + "</td><td rel = '" + "r" + _initknt + "' style = 'min-width:25%;padding:2px;'>" + '<button onclick = "removed=false;" id = "remove" ' + "data-val='"  + _initknt + "'" + ' class = "btn btn-primary btn-xs" file-id="' + file.name + '"  data-id = "' + _initknt  + '" >Remove</button></td><tr rel = "' + "r" + _initknt + '">'; 
                }
             else
                {     
                 var htm = "<td rel = '" + "r" + _initknt +  "' style = 'min-width:25%'>"  + "<img style = 'width:75px;height:75px;padding:5px;' src = '" + imgurl + "'>"  + "</td><td rel = '" + "r" + _initknt +  "' style = 'min-width:25%;padding:2px;'>" +  file.name + "</td><td rel = '" + "r" + _initknt + "' style = 'min-width:25%;padding:2px;'>" +  ftype + "</td><td rel = '" + "r" + _initknt + "' style = 'min-width:25%;text-align:right;padding:2px;'>" + Math.round((file.size/1024) * 100) / 100 + "</td><td rel = '" + "r" + _initknt + "' style = 'min-width:25%;padding:2px;'>" + '<button  onclick = "removed=false;" id = "remove" ' + "data-val='"  + _initknt + "'" + ' class = "btn btn-primary btn-xs" file-id="' + file.name + '"  data-id = "' + _initknt  + '" >Remove</button></td><tr rel = "' + "r" + _initknt + '">'; 
                } 
             dt = {};
             dt['data'] = data;
             dt['id'] = _initknt;
             selectedforuploads.push(dt);
             dt = {};
             dt['file'] = file.name;
             dt['id'] = _initknt;
             selectedfilenames.push(dt); 
             uploadedfilename.push(file.name);
             filesizes.push(file.size);
             selectedfiletypes.push(ftype);
             $("#filesholder").html($("#filesholder").html() + htm);
             $("#filesholder").show();
             $("#upload").trigger("click"); 
          if (_initknt >= 0)
             {
//              _initknt = _totalfiles;
//              $("#files").append('<button id = "upload" rel = "upload" style = "display:none;" class = "btn btn-primary btn-responsive">Upload</button>');
//              uploadedfilename=[];
//              return;
             }     
//           $("#describe").html("Drag and Drop "+utype + " or Choose "+utype);
          });
      }).on('fileuploadprocessalways', function (e, data) {
      }).on('fileuploadprogressall', function (e, data) {
          $("#pprogress").show();
          var progress = parseInt(data.loaded / data.total * 100, 10); 
          $("#pprogress").html(progress+"%");
          $('#progress .progress-bar').css(
              'width',
             progress +  "%"
          );
      }).on('fileuploaddone', function (e, data) {
             if (!data.error){
                  dupfile = false;
                  for (ifil = 0; ifil < uploadedfilename.length; ifil++)
                      {
                       if (uploadedfilename[ifil] ==  data.result.name)
                          {
                           dupfile = true;
                           break;
                          }
                      }
                  if (!dupfile)
                     {         
                      uploadedfilename.push(data.result.name);
                      iuploadcounter++;
                     }
                 $("#timer6").oneTime(400,function(){
                     $("#timer6").stopTime();
                     $("#pprogress").hide();
                     $('#progress').html('');
                     $('#progress').html('<div class="progress-bar progress-bar-success"></div>');
                  });
                  var fid = data.result.name;
                  $("[file-id='" + fid + "']").html("Uploaded").prop("disabled",true);
                  filesuploaded = true;
                  addfiles(false,"",[]);
              } else if (data.error) {
                var fid = file.name;
                $("[file-id='" + fid + "']").html("Error Uploading").prop("disabled",true);
                $("#timer7").oneTime(1500,function(){
                  $("#timer7").stopTime();
                  for (var isel = 0; isel < selectedfilenames.length; isel++)
                      {
                       var eid = "r" + isel ;
                       $("[rel='" + eid + "']").remove();                 
                      }  
                  $('#progress').html('');
                  $('#progress').html('<div class="progress-bar progress-bar-success"></div>');
                  $("#upload").remove();
                  alertbox(data.error,1,"Error !!!","");
//                  location.reload(true)
                });
              }
      }).on('fileuploadfail', function (e, data) { 
          $.each(data.files, function (index, file) {
            var fid = file.name;
            $("[file-id='" + fid + "']").html("Error Uploading").prop("disabled",true);
          });
          $("#timer6").oneTime(4500,function(){
             $("#timer6").stopTime();
             for (var isel = 0; isel < selectedfilenames.length; isel++)
                 {
                  var eid = "r" + isel ;
                  $("[rel='" + eid + "']").remove();                 
                 }  
             $("#pprogress").hide();
             $('#progress').html('');
             $('#progress').html('<div class="progress-bar progress-bar-success"></div>');
             $("#upload").remove();
//             location.reload(true);
          });
      }).prop('disabled', !$.support.fileInput)
          .parent().addClass($.support.fileInput ? undefined : 'disabled');
     }
    catch(err)
     { 
      console.log(err);
     }   
// });
  }

setTimeout(function(){
       fileuploads()
},200)

function resetvalues(){
  if (confirmation_yes){
      $(".loadingtext").css("display","none");
      $(".loadingtext1").css("display","none");

      $(".loading").css("display","none");

      _totalfiles = 1;
      _initknt = 0;
      selectedforuploads = [];
      okprogram = "";
      cancelprogram = "";
      selectedfilenames = [];
      filesizes = [];
      filesuploaded = false;
      uploadedfilename = [];
      removed = false;
      iuploadcounter = 0;
      eventprogress = false;
      $("#filesholder").hide();
      iuploadcounter = 0;
      $("#upload").hide();
      wid = $("#files").width();
      $("#files").html('<table border = "1" style = "width:'+wid+'px'+';display:none;" id="filesholder" class="files"><th></th><th>Name</th><th>Linked to</th><th>Size</th><th></th></table>');
//      $("#files").html('<table border = "1" style = "width:100%;display:none;" id="filesholder" class="files"><th></th><th>Name</th><th>Linked to</th><th>Size</th><th></th></table>');
     }     
 }


$(document).on("click" , "#upload" ,function(event){ 
   event.preventDefault();
   event.stopPropagation();
   $("#progress").show();
   iuploadcounter = -1;
   eventprogress = true;
   $(".loadingtext").css("display","none");
   $(".loadingtext1").css("display","none");
   $(".loading").css("display","block");
   $("#timer4").everyTime(1000,function(){
     if (iuploadcounter >= selectedforuploads.length-1){
         $("#timer4").stopTime()
         eventprogress = false; 
         $("#timer5").oneTime(1500,function(){
            $("#timer5").stopTime();
            $("#files").html('');
            $("#progress").hide();
            $("#filesholder").hide();
            iuploadcounter = 0;
            $("#upload").remove();
            $(".loadingtext").css("display","none");
            $(".loadingtext1").css("display","none");
            $(".loading").css("display","none");
            confirmation_yes = true
            resetvalues()
         }); 
     }else{ 
          iuploadcounter++;
          selectedforuploads[iuploadcounter]['data'].submit();
     } 
  });
}) 

function addfiles(splits,id,existval){ 
   $(".loadingtext").css("display","none");
   $(".loadingtext1").css("display","none");
   $(".loading").css("display","block");
   $.ajax({type: "POST",url: "./getFiles",async:true,dataType:"json",
      success: function(data){ 
         if (id){
             gdata = data;
             $("#vsplits").empty(); 
             $("#vsplits").selectpicker("refresh");
             firstitem = true;
             evals = "";
             if (existval && existval.length){
                 evals = existval.join(";")+";";
             }
             for (idata = 0; idata < data.length; idata++){
                  if (data[idata].id === id){
                      for (isubdata in data[idata].splitfiles){
                           if (evals.indexOf(isubdata+";") > -1){
                               $("#vsplits").append('<option selected rel = "t_'+ isubdata + '" id = "f_'+data[idata].id+'">'+isubdata+'</option>');
                           }else{
                               $("#vsplits").append('<option rel = "t_'+ isubdata + '" id = "f_'+data[idata].id+'">'+isubdata+'</option>');
                           }
                      } 
                  }
             }
             $("#vsplits").selectpicker("refresh");
             $("#vsplit").css("display","block");
             $(".loadingtext").css("display","none");
             $(".loadingtext1").css("display","none");
             $(".loading").css("display","none");
             $(".cards").empty();
             return;
         }
         if (data.length == 0){
             $("#vsplt").hide();
             $("#vsplit").hide();
             $(".loadingtext").css("display","none");
             $(".loadingtext1").css("display","none");
             $(".loading").css("display","none");
             $("#vfiles").empty(); 
             $("#vfiles").selectpicker("refresh");
             $("#vfile").hide();
             $(".cards").empty();
             return;
         }
         $("#vfiles").empty(); 
         $("#vfiles").selectpicker("refresh");
         firstitem = true;
         id = "";
         for (idata = 0; idata < data.length; idata++){
              if (firstitem){
                  id = data[idata].id;
                  $("#vdelete").show();
                  $("#vfiles").append('<option selected rel = "t_'+ idata + '" id = "f_'+data[idata].id+'">'+data[idata].name+'</option>');
              }else{
                  $("#vfiles").append('<option  rel = "t_'+ idata + '" id = "f_'+data[idata].id+'">'+data[idata].name+'</option>');
              }
         }
         $("#vfiles").selectpicker("refresh");
         $("#vfile").show();
         $("#vsplt").show();
         $("#vsplit").hide();
         if (id){
             $("#vsplit").hide();
             firstitem = true;
             for (idata = 0; idata < data.length; idata++){
                  if (data[idata].id === id){
                      sfiles = false;
                      $("#vsplits").empty(); 
                      $("#vsplits").selectpicker("refresh");
                      for (isubdata in data[idata].splitfiles){
                           sfiles = true;
                           $("#vsplits").append('<option rel = "t_'+ isubdata + '" id = "f_'+data[idata].id+'">'+isubdata+'</option>');
                      } 
                      if (sfiles){
                          $("#vsplit").show();
                          $("#vsplits").selectpicker("refresh");
                      }
                  }
             }
         }
         $(".loadingtext").css("display","none");
         $(".loadingtext1").css("display","none");
         $(".loading").css("display","none");
         $(".cards").empty();
         gdata = data;
      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
           confirmation_yes = true;    
           resetvalues()
           processingdata = false;
           if (jqXHR.status === 0)
              {
              } 
           if (jqXHR.status == 404)
              {
               alertbox('Requested page could not be found. [404]',1,"Error !!!","");
              }
           if (jqXHR.status == 500)
              {
               alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
              }
           if (exception === 'timeout') 
              {
               alertbox('Time out error.',1,"Error !!!","");
              } 
           if (exception === 'parsererror')
              {
               alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
              }  
       }
    });
}

$(document).on("click","#vslpts",function(d){
   d.stopPropagation();
   d.preventDefault();
   id = document.getElementById("vfiles").options[document.getElementById("vfiles").options.selectedIndex].id;
   impfiles = "";
   splitpath = "";
   for (idata = 0; idata < gdata.length; idata++){
        if (gdata[idata].id === id.split("_")[1]){
            impfiles = gdata[idata].files;
            splitpath = gdata[idata].splitpath;
            break;
        }
   }
   $(".loadingtext").css("display","none");
   $(".loadingtext1").css("display","none");
   $(".loading").css("display","block");
   filesprocessed = [];
   getSplitData(id.split("_")[1],impfiles);
//   generateSplits(id.split("_")[1],impfiles,splitpath,$("#vsplits").val());
})

filesadded = false;
filescount = 0;
filesaddedcount = 0;
filestimer = null;

function getSplitData(id){
   $.ajax({type: "POST",url: "./getSplitData",data:JSON.stringify({"id":id,"files":impfiles}),async:true,dataType:"json",
     success: function(data){ 
      if (data.status != "Done"){
          if (data.status == "Not done Yet"){
          }else{
              return false;
          }
       }
       datafiles = data;
       finalfiles = [];
       datafound = false;
       for (ifinal in datafiles.filestoprocess){
            datafound = true;
            ifn = {};
            ifn.id = ifinal.split("-")[1].trim();
            ifn.data = datafiles.filestoprocess[ifinal]
            finalfiles.push(ifn);
       }
       starttime = finalfiles[0].data.timestart;
       endtime = finalfiles[finalfiles.length-1].data.timeend
       if (!datafound){
           return;
       }
       finalfiles.sort(function(a,b){
           timea = a.data.vent.split(":");
           timeb = b.data.vent.split(":");
           time1 = 0;
           time1 += parseFloat(timea[2]);
           time1 += parseFloat(timea[1]) * 60;
           time1 += parseFloat(timea[0]) * 60 * 60;
           time2 = 0;
           time2 += parseFloat(timeb[2]);
           time2 += parseFloat(timeb[1]) * 60;
           time2 += parseFloat(timeb[0]) * 60 * 60;
           if (time1 > time2){
               return 1;
           }
           return -1
       })
       totaldata = 0;
       if ($("#multithread").is(":checked")){
           totaldata = finalfiles.length;
           ffiles = [];
           tdata = totaldata/multithreadcounter;
           ttdata = parseInt(tdata);
           start = 0;
           for (ittdata = 0; ittdata < ttdata; ittdata++){
                fdata = [];
                for (istart = start; istart < start+multithreadcounter; istart++){
                     fdata.push(finalfiles[istart]);  
                }
                ffiles.push(fdata);
                start += multithreadcounter
           }
           if (tdata - parseInt(tdata) > 0){
               tdata = (tdata - parseInt(tdata)) * multithreadcounter;
               fdata = [];
               for (istart = start; istart < start+tdata; istart++){
                    fdata.push(finalfiles[istart]);  
               }
               ffiles.push(fdata);               
           }
           finalfiles = ffiles;
       }
       tobecompleted = {};
       filescount = finalfiles.length;  
       filesaddedcount = -1;
       filesadded = true;
       filestimer = setInterval(function(){
            if (filesadded){
                filesaddedcount++;
                if (filesaddedcount > filescount-1){
                    if ($("#multithread").is(":checked")){
                        getstatusFile();
                        if (statusfile){ 
                            for (istat = 0; istat < statusfile.length; istat++){ 
                                 $("#chid").text(statusfile[istat]);
                            }
                        }
                        if (filesprocessed.length >= totaldata){
                            clearInterval(filestimer);
                            $(".loadingtext").css("display","none");
                            $(".loadingtext1").css("display","none");
                            $(".loading").css("display","none");
                            addfiles(true,id,$("#vsplits").val());
                        }
                    }else{
                       clearInterval(filestimer);
                       $(".loadingtext").css("display","none");
                       $(".loadingtext1").css("display","none");
                       $(".loading").css("display","none");
                       addfiles(true,id,$("#vsplits").val());
                    }
                    return;
                }
                filesadded = false;
                if ($("#multithread").is(":checked")){
                    for (ilines = 0; ilines < finalfiles[filesaddedcount].length; ilines++){
                         tobecompleted[finalfiles[filesaddedcount][ilines].id] = 1;
                    }
                }else{
                    tobecompleted[finalfiles[filesaddedcount].id] = 1;
                }
                $(".loading").css("display","block");
                $(".loadingtext").css("display","block");
                $(".loadingtext1").css("display","block");
                $(".loadingtext").html("Now Doing " + finalfiles[filesaddedcount].id + " Completed 0%");
                $(".loadingtext").css("left",((window.innerWidth-$(".loadingtext").width())/2)+"px");
                $(".loadingtext1").html("["+(filesaddedcount + 1) + " of " +  (filescount)+"]");
                $(".loadingtext1").css("left",((window.innerWidth-$(".loadingtext1").width())/2)+"px");
                starttime =  finalfiles[filesaddedcount]
                if (filesaddedcount == filescount-1){  
                    status = generateSplits(id,impfiles,finalfiles[filesaddedcount],splitpath,$("#vsplits").val(),tobecompleted,starttime,endtime,1,filesaddedcount)    
                }else{
                    status = generateSplits(id,impfiles,finalfiles[filesaddedcount],splitpath,$("#vsplits").val(),tobecompleted,starttime,endtime,0,filesaddedcount)    
                }     
            }
            if (filesaddedcount > filescount-1){
            }else{
                if ($("#multithread").is(":checked")){
                    getstatusFile();
                    for (ilines = 0; ilines < finalfiles[filesaddedcount].length; ilines++){
                         checkfile(id,finalfiles[filesaddedcount][ilines].id,splitpath);
                    }
                }else{
                   checkfile(id,finalfiles[filesaddedcount].id,splitpath);
                }
            }
       },1000) 

      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
       confirmation_yes = true;    
       resetvalues()
       processingdata = false;
       if (jqXHR.status === 0){
       } 
       if (jqXHR.status == 404){
           alertbox('Requested page could not be found. [404]',1,"Error !!!","");
       }
       if (jqXHR.status == 500){
           alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
       }
       if (exception === 'timeout'){
           alertbox('Time out error.',1,"Error !!!","");
       } 
       if (exception === 'parsererror'){
           alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
       }  
      }
    });
}


$(document).on("change","#vfiles",function(d){
  d.stopPropagation();
  d.preventDefault();
  if (!$(this).val()){
      $("#vdelete").hide();
      $("#vpreview").hide();
      $("#vdownload").hide();
      $("#vsplt").hide();
      $("#vsplit").hide();
      $(".cards").empty();
      return;
  }
  $("#vpreview").hide();
  $("#vdownload").hide();
  id = document.getElementById("vfiles").options[document.getElementById("vfiles").options.selectedIndex].id;
  for (idata = 0; idata < gdata.length; idata++){
       if (gdata[idata].id === id.split("_")[1]){
           sfiles = false;
           $("#vsplits").empty(); 
           $("#vsplits").selectpicker("refresh");
           $("#vsplt").hide();
           $("#vsplit").hide();
           for (isubdata in gdata[idata].splitfiles){
                sfiles = true;
                $("#vsplits").append('<option rel = "t_'+ isubdata + '" id = "f_'+gdata[idata].id+'">'+isubdata+'</option>');
           } 
           $("#vsplits").selectpicker("refresh");
           $("#vsplit").css("display","block");
           if (sfiles){
              $("#vsplt").show();
              $("#vsplit").show();
           }else{
              $("#vsplt").show();
              $("#vsplit").hide();
           }
           break;
       }
  }
  previewcliecked = false;
  $("#vdelete").show();
  $(".cards").empty();
})

function getstatusFile(){
   $.ajax({type: "POST",url: "./getstatusFile",async:true,dataType:"json",
      success: function(data){ 
         statusfile = data.status;
         if (statusfile){ 
             for (istat = 0; istat < statusfile.length; istat++){
                  filesprocessed.push(statusfile[istat]);
                  filescompleted.push(statusfile[istat]);
                  $("#chid").text(statusfile[istat]);
             }
         }
      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
       confirmation_yes = true;    
       resetvalues()
       processingdata = false;
       if (jqXHR.status === 0)
          {
          } 
       if (jqXHR.status == 404)
          {
           alertbox('Requested page could not be found. [404]',1,"Error !!!","");
          }
        if (jqXHR.status == 500)
           {
            alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
           }
        if (exception === 'timeout') 
           {
            alertbox('Time out error.',1,"Error !!!","");
           } 
        if (exception === 'parsererror')
           {
            alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
           }  
       }
    });
}


function checkfile(fid,id,path){
   $.ajax({type: "POST",url: "./checkFile",data:JSON.stringify({"id":fid,"file":id,"splitpath":path,multithread:$("#multithread").is(":checked") ? 1 : 0}),async:true,dataType:"json",
      success: function(data){ 
          comp = Math.round(data.completed);
          if (comp > 100){
              comp = 100;
          }
          $(".loadingtext").html("Now Doing <label id = 'chid'>"+ id + "</label> Completed " + comp+"%");
          $(".loadingtext").css("left",((window.innerWidth-$(".loadingtext").width())/2)+"px");
          $(".loadingtext1").html("["+(filesaddedcount + 1) + " of " +  (filescount)+"]");
          $(".loadingtext1").css("left",((window.innerWidth-$(".loadingtext1").width())/2)+"px"); 
          if ($("#multithread").is(":checked")){
              if (filescompleted.length == multithreadcounter){
                  filescompleted = [];
                  filesadded = true;
              }
          }else{
              if (data.status === "File created"){
                  filesadded = true;
              }
          }
      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
       confirmation_yes = true;    
       resetvalues()
       processingdata = false;
       if (jqXHR.status === 0)
          {
          } 
       if (jqXHR.status == 404)
          {
           alertbox('Requested page could not be found. [404]',1,"Error !!!","");
          }
        if (jqXHR.status == 500)
           {
            alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
           }
        if (exception === 'timeout') 
           {
            alertbox('Time out error.',1,"Error !!!","");
           } 
        if (exception === 'parsererror')
           {
            alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
           }  
       }
    });
}


function generateSplits(id,impfiles,sefile,splitpath,existval,tobecompleted,start,end,ended,counter){
   prerolltime = $("#preroll").val();
   prerolltime = prerolltime.split("HH").join("00");
   prerolltime = prerolltime.split("MM").join("00");
   prerolltime = prerolltime.split("SS").join("00");
   postrolltime = $("#postroll").val();
   postrolltime = postrolltime.split("HH").join("00");
   postrolltime = postrolltime.split("MM").join("00");
   postrolltime = postrolltime.split("SS").join("00");
   offsettime = $("#offset").val();
   offsettime = offsettime.split("HH").join("00");
   offsettime = offsettime.split("MM").join("00");
   offsettime = offsettime.split("SS").join("00");
   symbol = $("#symbol").val();
   if (!offsettime){
       offsettime = "00:00:00";
   }
   if (!prerolltime){
       prerolltime = "00:00:00";
   }
   if (!postrolltime){
       postrolltime = "00:00:00";
   }
   if (!symbol){
       symbol ="+";
   }
   $.ajax({type: "POST",url: "./splitFiles",data:JSON.stringify({"id":id,"ended":ended,"counter":counter,"files":impfiles,"sefile":sefile,"splitpath":splitpath,"tobecompleted":tobecompleted,"symbol":symbol,"offsettime":offsettime,"prerolltime":prerolltime,"postrolltime":postrolltime,"vstart":start,"vend":end,multithread:$("#multithread").is(":checked") ? 1 : 0}),async:true,dataType:"json",
      success: function(data){ 
//         $(".loadingtext").css("display","none");
//         $(".loading").css("display","none");
//         addfiles(true,id,existval);
         if (data.error){
             clearInterval(filestimer);
             $(".loadingtext").css("display","none");
             $(".loadingtext1").css("display","none");
             $(".loading").css("display","none");
             addfiles(true,id,$("#vsplits").val());
             alertbox(data.error,1,"Error !!!","");
             return;
         }    
      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
       confirmation_yes = true;    
       resetvalues()
       processingdata = false;
       if (jqXHR.status === 0)
          {
          } 
       if (jqXHR.status == 404)
          {
           alertbox('Requested page could not be found. [404]',1,"Error !!!","");
          }
        if (jqXHR.status == 500)
           {
            alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
           }
        if (exception === 'timeout') 
           {
            alertbox('Time out error.',1,"Error !!!","");
           } 
        if (exception === 'parsererror')
           {
            alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
           }  
       }
    });
}

$(document).on("click","#vpreview",function(d){
  d.stopPropagation();
  d.preventDefault();
  $(".loadingtext").css("display","none");
  $(".loading").css("display","block");
  idx = document.getElementById("vsplits")[document.getElementById("vsplits").selectedIndex].id.split("_")[1];
  path = "";
  for (idata = 0; idata < gdata.length; idata++){
       if (gdata[idata].id == idx){
           path = unescape(gdata[idata].splitpath).split("\\").join("/");
           break;
       }
  }
  if (!path){
      return;
  }
  previewclicked = true;
  $(".cards").empty();
  videofileread(path)
})

function videofileread(path){
  files = "";
  for (icard = 0;icard < $("#vsplits").val().length; icard++){
       files += "||"+path+"/"+$("#vsplits").val()[icard];
  }
  filecollections = "";
  for (icard = 0;icard < $("#vsplits").val().length; icard++){
       filecollections += "||"+$("#vsplits").val()[icard];
  }  
  files = files.substr(2);
  filecollections = filecollections.substr(2);
  $.ajax({type: "POST",url: "./readFiles",data:JSON.stringify({"files":files,"file":filecollections}),async:true,dataType:"text",
      success: function(data){ 
         data = data.split("||99999||");
         html = "";
         for (idata = 0; idata < data.length; idata++){
              if (!data[idata]){
                  continue;
              }
              vdata = data[idata].split("||9999||");
              html += '<article class="card">'
              html += '<input checked id = "iselection" rel = "i_'+vdata[0]+'" type = "checkbox">'
              html += '<p id = "titleholder"><label id = "title">'+vdata[0]+'</label></p>';
              html += '<div>';
              html += '<video width="100%" height="100%" controls src="data:video/mp4;base64,' + vdata[1] + '" type = "video/mp4">'
              html += '</video>'
              html += "</article>"
              html += '</div>';
         }
         $(".cards").append(html);
         $(".loadingtext").css("display","none");
         $(".loading").css("display","none");
         if ($(window).width() < 830){
             titles = document.querySelectorAll("#title");
             for (ititle = 0; ititle < titles.length; ititle++){
                  titles[ititle].style.top = "-17px"
                  titles[ititle].style.paddingLeft = "10px";
                  titles[ititle].style.position = "relative";
                  titles[ititle].style.left = "2px"
             }
         }else{
             titles = document.querySelectorAll("#title");
             for (ititle = 0; ititle < titles.length; ititle++){
                  titles[ititle].style.top = "0px"
                  titles[ititle].style.paddingLeft = "10px";
                  titles[ititle].style.position = "relative";
                  titles[ititle].style.left = "2px"
             }
         }
      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
       confirmation_yes = true;    
       resetvalues()
       processingdata = false;
       if (jqXHR.status === 0)
          {
          } 
       if (jqXHR.status == 404)
          {
           alertbox('Requested page could not be found. [404]',1,"Error !!!","");
          }
        if (jqXHR.status == 500)
           {
            alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
           }
        if (exception === 'timeout') 
           {
            alertbox('Time out error.',1,"Error !!!","");
           } 
        if (exception === 'parsererror')
           {
            alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
           }  
       }
    });
}

$(document).on("change","#vsplits",function(d){
  d.stopPropagation();
  d.preventDefault();
  if (!$(this).val()){
      previewclicked = false;
      $(".cards").empty();
      $("#vpreview").hide();
      $("#vdownload").hide();
  }else{
      $("#vpreview").show();
      $("#vdownload").show();
  }
})

$(document).on("click","#vselect",function(d){
  d.stopPropagation();
  d.preventDefault();
  selval = $("#vsplits").val();
  if (selval){
      selval = selval.join(";")+";"
  }
  idx = document.getElementById("vfiles")[document.getElementById("vfiles").selectedIndex].id.split("_")[1];
  $("#vsplits").empty(); 
  $("#vsplits").selectpicker("refresh");
  for (idata = 0; idata < gdata.length; idata++){
       if (gdata[idata].id === idx){
           for (isubdata in gdata[idata].splitfiles){
                if (selval){
                    if (selval.indexOf(isubdata+";") > -1){
                        $("#vsplits").append('<option rel = "t_'+ isubdata + '" id = "f_'+gdata[idata].id+'">'+isubdata+'</option>');
                    }else{
                        $("#vsplits").append('<option selected rel = "t_'+ isubdata + '" id = "f_'+gdata[idata].id+'">'+isubdata+'</option>');
                    }
                }else{
                    $("#vsplits").append('<option selected rel = "t_'+ isubdata + '" id = "f_'+gdata[idata].id+'">'+isubdata+'</option>');
                }
           } 
       }
  }
  $("#vsplits").selectpicker("refresh");
  if (!$("#vsplits").val()){
      $("#vpreview").hide();
      $("#vdownload").hide();
  }else{
      $("#vpreview").show();
      $("#vdownload").show();
  }
})

$(document).on("click","#vdownload",function(d){
  d.stopPropagation();
  d.preventDefault();
  sels = document.querySelectorAll("#iselection");
  files = "";
  for (isels = 0; isels < sels.length; isels++){
       if (sels[isels].checked){
           file = sels[isels].getAttribute("rel").split("_");
           file = file[1]+"_"+file[2];
           files += "||"+file
       }
  }
  sfile = $("#vfiles").val();
  files = files.substr(2);
  idx = document.getElementById("vfiles")[document.getElementById("vfiles").selectedIndex].id.split("_")[1];
  splitpath = "";
  for (idata = 0; idata < gdata.length; idata++){
       if (gdata[idata].id === idx){
           splitpath = gdata[idata].splitpath;
           break;
       }
  }
  if (files){
      $(".loadingtext").css("display","none");
      $(".loading").css("display","block");
      downloadinprocess = true;
      processzip(sfile,files,splitpath);
  }
})

function downloadzip(file){
    var link = document.createElement("a");
    link.setAttribute('download', name);
    link.href = "./downloadZip";
    document.body.appendChild(link);
    link.click();
//    link.remove();
    return;
}

function processzip(tfile,sfile,splitpath){
   $.ajax({type: "POST",url: "./zipFiles",data:JSON.stringify({"sfile":sfile,"tfile":tfile,"splitpath":splitpath}),async:true,dataType:"json",
      success: function(data){ 
         $(".loadingtext").css("display","none");
         $(".loading").css("display","none");
         if (!data.error){
             downloadzip(data.file)
             setTimeout(function(){
                downloadinprocess = false;
             },10000);
         }else{
             alertbox(data.error,1,"Error !!!","");
         }
      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
       confirmation_yes = true;    
       resetvalues()
       processingdata = false;
       if (jqXHR.status === 0)
          {
          } 
       if (jqXHR.status == 404)
          {
           alertbox('Requested page could not be found. [404]',1,"Error !!!","");
          }
        if (jqXHR.status == 500)
           {
            alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
           }
        if (exception === 'timeout') 
           {
            alertbox('Time out error.',1,"Error !!!","");
           } 
        if (exception === 'parsererror')
           {
            alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
           }  
       }
    });
}
resizetimer = null;
$( window ).resize(function(d) {
  if (downloadinprocess){
      return;
  }
  d.stopPropagation();
  d.preventDefault();
//  location.reload(true);
  clearTimeout(resizetimer)
  resizetimer = setTimeout(function(){
     width = window.innerWidth;
     height = window.innerHeight;
     $("#wrapper").css("width",width+"px");
     $("#wrapper").css("height",height+"px");
     $("#videos").css("height",(height-$("#optionsholder").height()-80)+"px");  
     $("#vcards").css("height",((height-$("#optionsholder").height()) )+"px");
     $(".loadingtext").css("left",((window.innerWidth-$(".loadingtext").width())/2)+"px");
     $(".loadingtext1").css("left",((window.innerWidth-$(".loadingtext1").width())/2)+"px");
     $("#watermark").css("top",((height - $("#watermark").height())/2) + "px");
     if ($(window).width() < 830){
         titles = document.querySelectorAll("#title");
         for (ititle = 0; ititle < titles.length; ititle++){
              titles[ititle].style.top = "-17px"
              titles[ititle].style.paddingLeft = "10px";
              titles[ititle].style.position = "relative";
              titles[ititle].style.left = "2px"
         }
     }else{
           titles = document.querySelectorAll("#title");
           for (ititle = 0; ititle < titles.length; ititle++){
                titles[ititle].style.top = "0px"
                titles[ititle].style.paddingLeft = "10px";
                titles[ititle].style.position = "relative";
                titles[ititle].style.left = "2px"
           }
     }
     if (previewclicked){
        $(".loadingtext").css("display","none");
        $(".loading").css("display","block");
        idx = document.getElementById("vsplits")[document.getElementById("vsplits").selectedIndex].id.split("_")[1];
        path = "";
        for (idata = 0; idata < gdata.length; idata++){
             if (gdata[idata].id == idx){
                 path = unescape(gdata[idata].splitpath).split("\\").join("/");
                 break;
             }
        }
        $(".cards").empty();
        if (!path){
            return;
        }
        videofileread(path)
    }
  },1000)
})

$(document).on("click","#vdelete",function(d){
  d.stopPropagation();
  d.preventDefault();
  $(".loadingtext").css("display","none");
  $(".loading").css("display","block");
  id = document.getElementById("vfiles").options[document.getElementById("vfiles").options.selectedIndex].id;
  deletefile(id.split("_")[1]);
})


function deletefile(id){
   $.ajax({type: "POST",url: "./deleteFile",data:JSON.stringify({"id":id}),async:true,dataType:"json",
      success: function(data){ 
         $(".loadingtext").css("display","none");
         $(".loading").css("display","none");
         $(".cards").empty();
         addfiles(false,"",[])
      },
     complete : function(data)
      {
      },
     error: function(jqXHR, exception) 
      {
       confirmation_yes = true;    
       resetvalues()
       processingdata = false;
       if (jqXHR.status === 0)
          {
          } 
       if (jqXHR.status == 404)
          {
           alertbox('Requested page could not be found. [404]',1,"Error !!!","");
          }
        if (jqXHR.status == 500)
           {
            alertbox('Internal Server Error [500].  has an error on the page.',1,"Error !!!","");
           }
        if (exception === 'timeout') 
           {
            alertbox('Time out error.',1,"Error !!!","");
           } 
        if (exception === 'parsererror')
           {
            alertbox('There was a parse error.' + jqXHR.responseText + "\n\nPlease verify.",1,"Error !!!","");
           }  
       }
    });
}

addfiles(false,"",[])