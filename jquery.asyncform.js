
// Plugin created and maintained by Matthieu van den Bosch
// Documented on http://asyncform.consolelog.nl

(function( $ ) {
    $.fn.asyncform = function(options){
        var settings = $.extend({
            finalize: 'log',
            emptyOnReady: true,
            responseKey: 'responsetext'
        }, options );

        this.on('submit', function(event){
            event.preventDefault();

            var thisForm = $(this);

            var method = thisForm.attr('method');
            var action = thisForm.attr('action');
            var finalAction = settings.finalize;
            var notifier = settings.output;
            var empty = settings.emptyOnready;
            var responseKey = settings.responseKey;

            var dataString = {};
            var summaryData = {};
            var fileStore = {};
            var hasFiles = false;
            var inputs = thisForm.find('input, textarea, select');

             $.each(inputs, function(position, element){
                var thisName = $(element).attr('name');
                var thisPlaceholder = $(element).attr('placeholder');
                var thisValue = $(element).val();
                var thisType = $(element).attr('type');
                if(thisType != 'submit' && thisType != 'file' && thisType != 'checkbox'){
                    if(thisType != 'password'){
                        summaryData[thisPlaceholder] = thisValue;
                    }
                    else{
                        summaryData[thisPlaceholder] = '*********';
                    }
                    dataString[thisName] = thisValue;
                }
                else{
                    if(thisType == 'file' && thisValue != ''){
                        hasFiles = true;
                        var thisFile = $(element)[0].files[0];
                        var isImg = false;
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            if(thisFile['name'].match(/\.(jpg|jpeg|png|gif)$/)){
                                isImg = true;
                            }
                            fileStore[thisName] = {
                                'data' : e.target.result,
                                'name' : thisFile['name'],
                                'size' : (thisFile.size/1024/1024).toFixed(2),
                                'img'  : isImg
                            }
                        }
                        reader.readAsDataURL(thisFile);
                    }
                    if(thisType == 'checkbox'){
                        if($(element).prop('checked')){
                            var at = $(element).attr('value');
                            if (typeof at !== typeof undefined && at !== false) {
                                dataString[thisName] = thisValue;
                            }
                            else if(thisValue == ''){
                                dataString[thisName] = 'On';
                            }
                            summaryData[thisName] = 'Checked';
                        }
                        else{
                            summaryData[thisName] = 'Not checked';
                        }
                    }
                }
            })
            if('onSubmit' in options) options.onSubmit({inputs : inputs, form : thisForm});
            if(method == undefined) method = 'POST';
            // General ajax options
            var aOpt = {
                url: action,
                type: method,
                dataType: 'json'
            }
            // File input ajax options
            if(hasFiles == true){
                var fileInputs = $(thisForm).find(':file');
                var formdata = new FormData();
                // Add files to send data
                $.each(fileInputs, function(key, element){
                    formdata.append($(element).attr('name'), $(element)[0].files[0]);
                })
                $.each(dataString, function(key, value){
                    formdata.append(key, value);
                })
                aOpt['data'] = formdata;
                aOpt['enctype'] = 'multipart/form-data';
                aOpt['xhr'] = function() {
                        var myXhr = $.ajaxSettings.xhr();
                        if(myXhr.upload && 'onUpload' in options){
                            if('start' in options.onUpload) options.onUpload.start();
                            myXhr.upload.addEventListener('progress',function(e){
                                if(e.lengthComputable){
                                    var size = e.total;
                                    var uploaded = e.loaded;
                                    var percentage = (uploaded * 100)/size;
                                    options.onUpload.progress({percentage : percentage, size : size, uploaded : uploaded});
                                }
                            }, false);
                        }
                        return myXhr;
                },
                aOpt['cache'] = false;
                aOpt['processData']= false;
                aOpt['contentType']= false;
            }
            // Options for forms with no files
            else{
                aOpt['data'] = dataString;
            }
            // Carry on submission, asynchronously
            $.ajax(aOpt)
            .success(function(response){
                if('onSuccess' in options) options.onSuccess({response : response, inputs : inputs, form: thisForm, sent : dataString});
                switch(finalAction){
                    case 'serverResponse':
                        if(notifier == undefined) console.error('Asyncform: Finalize serverResponse selected without setting output element');
                        $(notifier).html(response[responseKey]).show(500);
                    break;

                    case 'summarize':
                        if(notifier == undefined) console.error('Asyncform: Finalize summarize selected without setting output element');
                        $(notifier).html('');
                        if(response[responseKey]){
                            $(notifier).append('<h3>'+response[responseKey]+'</h3>');
                        }
                        else{
                            $(notifier).append('<h3>Submitted data</h3>');
                        }
                        $.each(summaryData, function(name, value){
                            $(notifier).append('<b>'+name+'</b> : <em>'+value+'</em><br>');
                        })
                        if(hasFiles){
                            $(notifier).append('<br><h4>Uploaded files</h4>')
                            $.each(fileStore, function(inputName, fileInfo){
                                var imageContent = '<br>No preview available';
                                if(fileInfo['img'] == true)imageContent = '<br><img src="'+fileInfo['data']+'" style="width: 50%;">';
                                $(notifier).append('<hr><b>Formname: </b><em>'+inputName+'</em><br><b>Filename: </b><em>'+fileInfo['name']+'</em>'+'<br><b>Filesize: </b><em>'+fileInfo['size']+' MB</em>'+imageContent);
                            })
                        }
                        $(notifier).show(500);
                    break;

                    case 'refresh':
                        window.location.reload();
                    break;

                    case 'log':
                        console.log('Asyncform: ', {response:response, sent:dataString});
                    break;

                    default:
                        if(finalAction.indexOf("URL=") > -1) window.location.href = finalAction.replace('URL=', '');
                }
                if(empty == true) $(thisForm).trigger('reset');
            })
            .fail(function(error){
                if('onFail' in options) options.onFail({error : error})
                console.log(error);
            })
        })
    }
}( jQuery ));