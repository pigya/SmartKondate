import { useEffect, useRef } from 'react';

export default function VoiceInput({ listening, onTextChange, onRecognitionEnd }) {
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!listening) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      onTextChange(finalTranscript, true);
    };

    recognition.onend = () => {
      console.log("🎤 音声認識終了");
      onRecognitionEnd(); // ← ここ
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [listening]);

  return null;
}




// import { useState, useRef } from 'react';

// export default function VoiceInput({ onTextChange }) {
//   const recognitionRef = useRef(null);
//   const [isRecording, setIsRecording] = useState(false);

//   const startRecognition = () => {
//     if (!('webkitSpeechRecognition' in window)) {
//       alert('このブラウザは音声認識に対応していません');
//       return;
//     }

//     onTextChange(''); // 前回の結果をクリア

//     const recognition = new window.webkitSpeechRecognition();
//     recognition.lang = 'ja-JP';
//     recognition.continuous = true;
//     recognition.interimResults = false;

//     recognition.onresult = (event) => {
//       let interimTranscript = '';
//       for (let i = event.resultIndex; i < event.results.length; i++) {
//         interimTranscript += event.results[i][0].transcript;
//       }
//       onTextChange(prev => prev + interimTranscript + ' ');
//     };

//     recognition.onerror = (event) => {
//       console.error('認識エラー:', event.error);
//     };

//     recognition.onend = () => {
//       setIsRecording(false);
//     };

//     recognition.start();
//     recognitionRef.current = recognition;
//     setIsRecording(true);
//   };

//   const stopRecognition = () => {
//     if (recognitionRef.current) {
//       recognitionRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   return (
//     <div>
//       <button onClick={startRecognition} disabled={isRecording}>▶️ 開始</button>
//       <button onClick={stopRecognition} disabled={!isRecording}>⏹ 停止</button>
//     </div>
//   );
// }
