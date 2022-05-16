    function alertbox(amess,option,options,clback,title,clback1,clback2,clback3)
     { 
      if (option == 1)
         {
          bootbox.dialog
            ({
              message: amess,
              title: options,
              buttons: 
                 {
                  success: 
                    {
                     label: "Ok",
                     className: "btn-success",
                     callback: function() 
                        {
                        }
                    }
                 }
            });
         } 
      if (option == 2)
         {
          bootbox.dialog
            ({
              message: amess,
              title: "Confirmation!",
              buttons: 
                 {
                  success: 
                     {
                      label: "Ok",
                      className: "btn-success",
                      callback: function() 
                         {
                         }
                     },
                  danger: 
                     {
                      label: "Cancel",
                      className: "btn-danger",
                      callback: function() 
                         {
                         }
                     }
                 }
            });
         }
      if (option == 15)
         {
          bootbox.dialog
            ({
              message: options,
              title: "Confirmation!",
              buttons: 
                 {
                  danger: 
                     {
                      label: "Proceed with complete Remove",
                      className: "btn-danger btn-xs",
                      callback: function() 
                         {
                          if (clback1)
                             {
                              eval(clback1 + ";");
                             }  
                         }
                     },
                  success: 
                     {
                      label: "Hide from list and retain assets",
                      className: "btn-success btn-xs",
                      callback: function() 
                         {
                          if (clback2)
                             {
                              eval(clback2 + ";");
                             }  
                         }
                     },
                  noclick: 
                     {
                      label: "Cancel",
                      className: "btn-danger btn-xs",
                      callback: function() 
                         {
                         }
                     }
                 }
            });
         }


      if (option == 16)
         {
          bootbox.dialog
            ({
              message: options,
              title: "Change the values",
              buttons: 
                 {
                  success: 
                     {
                      label: "Update",
                      className: "btn-success btn-xs",
                      callback: function() 
                         {
                          if (clback1)
                             {
                              eval(clback1 + ";");
                             }  
                         }
                     },
                  noclick: 
                     {
                      label: "Cancel",
                      className: "btn-danger btn-xs",
                      callback: function() 
                         {
                         }
                     }
                 }
            });
         }

      if (option == 17)
         {
          bootbox.dialog
            ({
              message: options,
              title: "Add a new Farm",
              buttons: 
                 {
                  success: 
                     {
                      label: "Add",
                      className: "btn-success btn-xs",
                      callback: function() 
                         {
                          if (clback1)
                             {
                              eval(clback1 + ";");
                             }  
                         }
                     },
                  noclick: 
                     {
                      label: "Cancel",
                      className: "btn-danger btn-xs",
                      callback: function() 
                         {
                         }
                     }
                 }
            });
         }


      if (option == 3)
         {
          bootbox.dialog
           ({
             message: amess,
             title: "Confirmation!",
             buttons: 
                {
                 success: 
                    {
                     label: "Yes",
                     className: "btn-success",
                     callback: function() 
                         {
                          confirmation_yes = true;
                         }
                    },
                 danger: 
                    {
                     label: "No",
                     className: "btn-danger",
                     callback: function() 
                         {
                          confirmation_no = true;
                         }
                    }
                }
           });
         }   
      if (option == 4)
         {
          bootbox.dialog
            ({
              message: options,
              title: "Confirmation!",
              buttons: 
                 {
                  success: 
                     {
                      label: "Yes",
                      className: "btn-success",
                      callback: function() 
                          {
                           confirmation_yes = true;
                           if (clback)
                              {
                               eval(clback + ";");
                              }        
                          }
                     },
                  danger: 
                     {
                      label: "No",
                      className: "btn-danger",
                      callback: function() 
                          {
                           confirmation_no = true;
                           if (clback)
                              {
 //                              eval(clback + ";");
                              }        
                          }
                     }
                 }
            });
         }   
     if (option == 5)
        {
         bootbox.dialog
           ({
             message: options,
             title: title,
             className : "signpage",
             "id" : "mymodal"
           });
         boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'width: 88% !important;margin-left:6%;margin-top:1%;margin-right:10%;bottom:5%;');jQuery("#xsignupalert").css("width", "88%");},150);
//         boottime = setTimeout(function(){$(".modal-content").css("height", "300px");$("#terms").css("height", "345px")},60);
        }   
      if (option == 6)
         {
          bootbox.dialog
            ({
              message: options,
              title: title,
              className : "signpage",
              "id" : "mymodal"
            });
          boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'width: 41% !important;margin-left:31%;margin-top:1%;margin-right:10%;bottom:5%;');jQuery("#xsignupalert").css("width", "41%");},150);
//          boottime = setTimeout(function(){$(".modal-content").css("height", "300px");$("#terms").css("height", "345px")},60);
         } 
      if (option == 7)
         {
          bootbox.dialog
            ({
              message: options,
              title: title,
              className : "signpage",
              "id" : "mymodal"
            });
          boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'width: 81% !important;margin-left:11%;margin-top:2%;margin-right:10%;bottom:5%;');jQuery("#xsignupalert").css("width", "99%");},150);
         } 
     if (option == 8)
        {
         bootbox.dialog
           ({
             message: amess,
             title: options,
             buttons: 
                {
                 success: 
                   {
                    label: "Ok",
                    className: "btn-success",
                    callback: function() 
                        {
                         if (clback)
                            {
                             eval(clback + ";");
                            }        
                        }
                   }
                }
           });
        } 

     if (option == 9)
        {
         bootbox.dialog
           ({
             message: options,
             title: title,
             className : "signpage-custom",
             "id" : "mymodal"
           });
        }

     if (option == 10)
        {
         bootbox.dialog
           ({
             message: options,
             title: title,
             className : "signpage-in-custom",
             "id" : "mymodal"
           });
        }

     if (option == 11)
        {
         bootbox.dialog
           ({
             message: options,
             title: title,
             className : "streetviewholder",
             "id" : "mymodal"
           });
         boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'width: 81% !important;margin-left:11%;margin-top:1%;margin-right:10%;bottom:5%;');jQuery("#xsignupalert").css("width", "99%");},150);
//         boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'width: 81% !important;margin-left:11%;margin-top:2%;margin-right:10%;bottom:5%;height:600px;');jQuery(".modal-content").css("height", "800px");jQuery("#xsignupalert").css("width", "99%");jQuery("#xsignupalert").css("height", "500px");},150);
        }


     if (option == 12)
        {
         bootbox.dialog
           ({
             message: options,
             title: title,
             className : "generateddataviewholder",
             "id" : "mymodal"
           });
         boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'width: 86% !important;margin-left:7% !important;margin-top:-1% !important;margin-right:7% !important;bottom:5% !important;');jQuery("#xsignupalert").css("width", "99%");},150);
//         boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'width: 81% !important;margin-left:11%;margin-top:2%;margin-right:10%;bottom:5%;height:600px;');jQuery(".modal-content").css("height", "800px");jQuery("#xsignupalert").css("width", "99%");jQuery("#xsignupalert").css("height", "500px");},150);
        }

      if (option == 13)
         {
          bootbox.dialog
            ({
              message: options,
              title: title,
              className : "signpage",
              "id" : "mymodal"
            });
          boottime = setTimeout(function(){jQuery(".modal-dialog").attr('style', jQuery(".modal-content").attr('style') + '; ' + 'margin-top:8%;');},150);
         }  
    }   

