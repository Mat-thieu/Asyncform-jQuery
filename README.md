# jQuery Asyncform
A jQuery plugin for asynchronous forms, handles uploads and will soon handle clientside validation as well

I will post the documentation here at a later point, [for now you can read the docs here](http://asyncform.consolelog.nl)
## Example code
```javascript
$('#formy').asyncform({
    finalize: 'summarize',// Summarize, log, redirect(URL=http://example.com), serverResponse
    output: '#output',
    onSubmit: function(form){
        $(form['inputs']).prop('disabled', true);
    },
    onUpload: {
        start : function(){
            $('.progress').slideDown(500);
        },
        progress : function(progress){
            var strippedPercentage = parseInt(progress['percentage']);
            $('#formProg').html(strippedPercentage+'%').attr('aria-valuenow', strippedPercentage).css('width', strippedPercentage+'%');
        }
    },
    onSuccess: function(response){
        $('#formProg').html('Done!');
        $(response['inputs']).prop('disabled', false);
        $('.progress').delay(500).slideUp(500);
    },
    onFail: function(err){
        alert('An error has occured, please try again.');
        console.log(err);
    }
});
```
