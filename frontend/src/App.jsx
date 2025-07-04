import { useState } from 'react';
import VoiceInput from './components/VoiceInput';
import RecipeCandidateList from './components/RecipeCandidateList';

export default function App() {
  const [isListening, setIsListening] = useState(false);
  const [finalText, setFinalText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [shouldSearch, setShouldSearch] = useState(false); // ← 検索トリガー

  const handleTextChange = (text, isFinal) => {
    if (isFinal) {
      setFinalText(text);
    } else {
      setInterimText(text);
    }
  };

  const handleRecognitionEnd = () => {
    setIsListening(false);
    setShouldSearch(true); // 検索トリガーをON
  };

  return (
    <div style={{ padding: '2em' }}>
      <h1>材料音声認識 & 料理候補検索</h1>

      <button onClick={() => {
        setFinalText('');
        setShouldSearch(false);
        setIsListening(true);
      }}>
        ▶️ 音声認識開始
      </button>

      <VoiceInput
        listening={isListening}
        onTextChange={handleTextChange}
        onRecognitionEnd={handleRecognitionEnd}
      />

      <p>
        {isListening ? `🎙️ 認識中...` : `✅ 材料確定: ${finalText}`}
      </p>

      {shouldSearch && (
        <RecipeCandidateList ingredients={finalText} />
      )}
    </div>
  );
}
