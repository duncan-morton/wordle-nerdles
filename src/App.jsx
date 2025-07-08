import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, Trophy, BarChart3, Users, Flame, AlertCircle } from 'lucide-react';

// Mock data - in real app, this would come from Firebase
const mockPlayers = [
  'Alex', 'Sarah', 'Mike', 'Emma', 'James', 'Lisa', 'Tom', 'Rachel'
];

const mockScoresToday = [
  { player: 'Emma', score: 2, time: '8:32 AM' },
  { player: 'Mike', score: 3, time: '9:15 AM' },
  { player: 'Sarah', score: 4, time: '10:45 AM' },
  { player: 'Alex', score: 3, time: '12:20 PM' },
  { player: 'James', score: 'X', time: '2:45 PM' }
];

const mockLeaderboard = [
  { name: 'Emma', score: 18, avg: 3.2, streak: 5 },
  { name: 'Mike', score: 20, avg: 3.5, streak: 3 },
  { name: 'Sarah', score: 22, avg: 3.8, streak: 6 },
  { name: 'Alex', score: 24, avg: 4.0, streak: 2 },
  { name: 'James', score: 27, avg: 3.9, streak: 1 }
];

const usedWords = ['CRANE', 'SLATE', 'AUDIO', 'ROAST', 'STARE', 'ADIEU', 'AROSE', 'LEARN'];

const WordleNerdlesApp = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedScore, setSelectedScore] = useState(null);
  const [showWordSubmit, setShowWordSubmit] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [wordStatus, setWordStatus] = useState({ message: '', type: '' });
  const [submitted, setSubmitted] = useState(false);

  const currentWeek = 12;
  const currentWordPicker = 'Sarah';
  const nextWordPicker = 'Tom';
  const currentWord = 'CRANE';

  const handleScoreSubmit = () => {
    if (selectedPlayer && selectedScore) {
      // In real app, this would save to Firebase
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedPlayer('');
        setSelectedScore(null);
      }, 2000);
    }
  };

  const checkWord = () => {
    const word = wordInput.toUpperCase();
    
    if (word.length !== 5) {
      setWordStatus({ message: '❌ Word must be exactly 5 letters', type: 'invalid' });
    } else if (usedWords.includes(word)) {
      setWordStatus({ message: '❌ This word has already been used!', type: 'invalid' });
    } else if (!/^[A-Z]{5}$/.test(word)) {
      setWordStatus({ message: '❌ Word must contain only letters', type: 'invalid' });
    } else {
      setWordStatus({ message: '✅ Great choice! This word is available', type: 'valid' });
    }
  };

  const getMissingPlayers = () => {
    const submittedPlayers = mockScoresToday.map(s => s.player);
    return mockPlayers.filter(p => !submittedPlayers.includes(p));
  };

  const getScoreColor = (score) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-green-500',
      3: 'bg-yellow-500',
      4: 'bg-yellow-500',
      5: 'bg-orange-500',
      6: 'bg-orange-500',
      'X': 'bg-gray-500'
    };
    return colors[score] || 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black rounded-3xl p-2 shadow-2xl" style={{ height: '812px' }}>
        <div className="h-full bg-white rounded-2xl overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="px-6 py-2 flex justify-between text-xs text-gray-600">
            <span>9:41 AM</span>
            <span>📶 📷 🔋</span>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-1">Wordle Nerdles 🤓</h1>
            <div className="text-sm opacity-90">Week {currentWeek} • Started by {currentWordPicker}</div>
            <div className="mt-2 inline-block bg-white/20 px-4 py-1 rounded-full">
              <span className="text-base">This week's word: <strong>{currentWord}</strong></span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-50 border-b">
            {['submit', 'leaderboard', 'today', 'stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-2 text-sm font-medium capitalize transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-purple-600 border-b-2 border-purple-600' 
                    : 'text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Submit Tab */}
            {activeTab === 'submit' && (
              <div className="p-6">
                <div className="space-y-4">
                  <select 
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="w-full p-4 text-base border-2 border-gray-200 rounded-lg"
                  >
                    <option value="">Select your name...</option>
                    {mockPlayers.map(player => (
                      <option key={player} value={player}>{player}</option>
                    ))}
                  </select>

                  <h3 className="text-center text-gray-600 font-medium">Today's Score</h3>

                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <button
                        key={num}
                        onClick={() => setSelectedScore(num)}
                        className={`aspect-square text-2xl font-bold rounded-xl border-2 transition-all ${
                          selectedScore === num 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'bg-white border-gray-200 hover:border-purple-400'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedScore('X')}
                      className={`col-span-3 py-5 text-xl font-bold rounded-xl border-2 transition-all ${
                        selectedScore === 'X' 
                          ? 'bg-red-500 text-white border-red-500' 
                          : 'bg-white border-gray-200 hover:border-red-400'
                      }`}
                    >
                      💀 BUST
                    </button>
                  </div>

                  <button
                    onClick={handleScoreSubmit}
                    disabled={!selectedPlayer || !selectedScore}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                  >
                    {submitted ? '✅ Submitted!' : 'Submit Score'}
                  </button>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="p-6 space-y-3">
                {mockLeaderboard.map((player, index) => (
                  <div key={player.name} className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                    <div className={`text-2xl font-bold w-8 text-center ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-orange-600' : 'text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 ml-4">
                      <div className="font-semibold">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        Avg: {player.avg} • Streak: {player.streak} {player.streak >= 5 && '🔥'}
                      </div>
                    </div>
                    <div className="text-xl font-bold text-purple-600">{player.score}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Today Tab */}
            {activeTab === 'today' && (
              <div className="p-6">
                {getMissingPlayers().length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">⏰ Still waiting for (11:30 PM deadline):</h4>
                    <div className="flex flex-wrap gap-2">
                      {getMissingPlayers().map(player => (
                        <span key={player} className="bg-yellow-800 text-white px-3 py-1 rounded-full text-sm">
                          {player}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-gray-700 mb-4">Today's Scores</h3>
                
                <div className="space-y-2">
                  {mockScoresToday.map((entry, i) => (
                    <div key={i} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                      <div className={`w-10 h-10 ${getScoreColor(entry.score)} text-white rounded-lg flex items-center justify-center font-bold`}>
                        {entry.score}
                      </div>
                      <div className="flex-1 ml-4 font-medium">{entry.player}</div>
                      <div className="text-xs text-gray-500">{entry.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-xl text-center">
                  <h3 className="text-sm font-medium mb-1">Next Week's Word Picker</h3>
                  <p className="text-xl font-bold">🎯 {nextWordPicker}</p>
                  {nextWordPicker === 'Tom' && (
                    <button
                      onClick={() => setShowWordSubmit(!showWordSubmit)}
                      className="mt-2 bg-white text-red-600 px-4 py-2 rounded-full text-sm font-bold"
                    >
                      Submit Starting Word
                    </button>
                  )}
                </div>

                {showWordSubmit && (
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h4 className="font-semibold mb-2">Submit Starting Word</h4>
                    <input
                      type="text"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                      maxLength={5}
                      placeholder="Enter 5-letter word"
                      className="w-full p-3 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg tracking-widest"
                    />
                    {wordStatus.message && (
                      <div className={`mt-2 p-2 rounded text-sm text-center ${
                        wordStatus.type === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {wordStatus.message}
                      </div>
                    )}
                    <button
                      onClick={checkWord}
                      className="w-full mt-3 py-3 bg-purple-600 text-white font-bold rounded-lg"
                    >
                      Check & Submit
                    </button>
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold mb-3">📝 Previous Starting Words</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {[
                      { word: 'CRANE', week: 12, picker: 'Sarah' },
                      { word: 'SLATE', week: 11, picker: 'Mike' },
                      { word: 'AUDIO', week: 10, picker: 'Emma' },
                      { word: 'ROAST', week: 9, picker: 'Alex' }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="font-bold text-purple-600 tracking-wider">{item.word}</span>
                        <span className="text-xs text-gray-500">Week {item.week} - {item.picker}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold mb-3">📊 This Week</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Best Score Today</span>
                      <span className="font-semibold text-purple-600">Emma (2)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Group Average</span>
                      <span className="font-semibold text-purple-600">3.4</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-semibold text-purple-600">62.5% (5/8)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordleNerdlesApp;
