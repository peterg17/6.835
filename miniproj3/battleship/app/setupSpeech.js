/*****************************************************************/
/******** SPEECH RECOGNITION SETUP YOU CAN IGNORE ****************/
/*****************************************************************/


// if (!('webkitSpeechRecognition' in window)) {
//   upgrade();
// } else {
//   var recognition = new webkitSpeechRecognition();
//   recognition.continuous = true;
//   recognition.interimResults = true;
//   final_transcript = '';
//   recognition.lang = 2;
//   recognition.start();

//   recognition.onresult = function(event) {
//     var interim_transcript = '';

//     for (var i = event.resultIndex; i < event.results.length; ++i) {
//       if (event.results[i].isFinal) {
//         final_transcript += event.results[i][0].transcript;
//       } else {
//         interim_transcript += event.results[i][0].transcript;
//       }
//     }
//     final_transcript = capitalize(final_transcript);
//     console.log("final transcript: " + final_transcript);
//   };
// }


var debouncedProcessSpeech = _.debounce(processSpeech, 500);

console.log("loading setup speech");
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.onresult = function(event) {
  // Build the interim transcript, so we can process speech faster
  var transcript = '';
  var hasFinal = false;
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal)
      hasFinal = true;
    else
      transcript += event.results[i][0].transcript;
  }
  console.log("event: " + event);

  if (DEBUGSPEECH) {
    if (hasFinal)
      otherFeedback.setContent("SPEECH DEBUG: ready");
    else
      otherFeedback.setContent("SPEECH DEBUG: " + transcript);
  }

  var processed = debouncedProcessSpeech(transcript);
  // var processed = processSpeech(transcript);

  // If we reacted to speech, kill recognition and restart
  if (processed) {
    recognition.stop();
  }
};
// Restart recognition if it has stopped
recognition.onend = function(event) {
  setTimeout(function() {
    if (DEBUGSPEECH)
      otherFeedback.setContent("SPEECH DEBUG: ready");
    recognition.start();
  }, 1000);
};
recognition.start();
/*****************************************************************/
/******** END OF SPEECH RECOG SETUP ******************************/
/*****************************************************************/

