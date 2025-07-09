import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, BarChart3, Users } from 'lucide-react';
import { collection, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Demo version showing how the app will work with Firebase
// In your actual implementation, you'll connect to Firebase

const WordleNerdlesApp = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedScore, setSelectedScore] = useState(null);
  const [showWordSubmit, setShowWordSubmit] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [wordStatus, setWordStatus] = useState({ message: '', type: '' });
  const [submitted, setSubmitted] = useState(false);

  // Demo data – in your real app, these come from Firebase
const [players, setPlayers] = useState([]);
const [loading, setLoading] = useState(true);

  const [todayScores, setTodayScores] = useState([
    { id: '1', player: 'Emma', score: 2, time: '8:32 AM' },
    { id: '2', player: 'Mike', score: 3, time: '9:15 AM' }
  ]);

  const [weeklyScores] = useState([
    { name: 'Emma', totalScore: 18, avg: 3.2, streak: 5 },
    { name: 'Mike', totalScore: 20, avg: 3.5, streak: 3 },
    { name: 'Sarah', totalScore: 22, avg: 3.8, streak: 6 }
  ]);

  const [usedWords] = useState([
    { word: 'CRANE', week: 12, picker: 'Sarah' },
    { word: 'SLATE', week: 11, picker: 'Mike' },
    { word: 'AUDIO', week: 10, picker: 'Emma' }
  ]);

useEffect(() => {
  console.log('Loading players from Firebase...');
  try {
    const unsubscribe = onSnapshot(collection(db, 'players'), 
      (snapshot) => {
        console.log('Snapshot received:', snapshot.docs.length, 'players');
        const playersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log('Players data:', playersData);
        setPlayers(playersData);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase error:', error);
      }
    );

    return () => unsubscribe();
  } catch (error) {
    console.error('Setup error:', error);
  }
}, []);
  const unsubscribe = onSnapshot(collection(db, 'players'), (snapshot) => {
    const playersData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPlayers(playersData);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const currentWeek = 12;
  const currentWordData = { word: 'CRANE', picker: 'Sarah' };

  // Submit score
  const handleScoreSubmit = async () => {
    if (!selectedPlayer || selectedScore === null) return;

    try {
      // Save to Firebase
      await addDoc(collection(db, 'scores'), {
        player: selectedPlayer,
        score: selectedScore,
        week: currentWeek,
        date: Timestamp.now()
      });

      console.log('Score saved to Firebase!');
      setSubmitted(true);

      // Add to local state for immediate display
      const newScore = {
        id: Date.now().toString(),
        player: selectedPlayer,
        score: selectedScore,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      };

      setTodayScores([...todayScores, newScore]);

      setTimeout(() => {
        setSubmitted(false);
        setSelectedPlayer('');
        setSelectedScore(null);
      }, 2000);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Error submitting score. Please check Firebase setup.');
    }
  };

  // Check and submit word
  const submitWord = async () => {
    const word = wordInput.toUpperCase();

    if (word.length !== 5) {
      setWordStatus({ message: '❌ Word must be exactly 5 letters', type: 'invalid' });
      return;
    }

    if (!/^[A-Z]{5}$/.test(word)) {
      setWordStatus({ message: '❌ Word must contain only letters', type: 'invalid' });
      return;
    }

    const wordExists = usedWords.some(w => w.word === word);
    if (wordExists) {
      setWordStatus({ message: '❌ This word has already been used!', type: 'invalid' });
      return;
    }

    // In real app, this saves to Firebase
    setWordStatus({ message: '✅ Word submitted successfully!', type: 'valid' });
    setWordInput('');

    setTimeout(() => {
      setShowWordSubmit(false);
      setWordStatus({ message: '', type: '' });
    }, 2000);
  };

  // Helpers
  const getMissingPlayers = () => {
    const submittedPlayers = todayScores.map(s => s.player);
    return players
      .map(p => p.name)
      .filter(name => !submittedPlayers.includes(name));
  };

  const getScoreColor = (score) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-green-500',
      3: 'bg-yellow-500',
      4: 'bg-yellow-500',
      5: 'bg-orange-500',
      6: 'bg-orange-500',
      X: 'bg-gray-500'
    };
    return colors[score] || 'bg-gray-400';
  };

  /* ---------- JSX ---------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black rounded-3xl p-2 shadow-2xl" style={{ height: '812px' }}>
        <div className="h-full bg-white rounded-2xl overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="px-6 py-2 flex justify-between text-xs text-gray-600">
            <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            <span>📶 📷 🔋</span>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-1">Wordle Nerdles 🤓</h1>
            <div className="text-sm opacity-90">
              Week {currentWeek} • Started by {currentWordData.picker}
            </div>
            <div className="mt-2 inline-block bg-white/20 px-4 py-1 rounded-full">
              <span className="text-base">
                This week's word: <strong>{currentWordData.word}</strong>
              </span>
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
                    {players.map(player => (
                      <option key={player.id} value={player.name}>{player.name}</option>
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
                    disabled={!selectedPlayer || selectedScore === null}
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                  >
                    {submitted ? '✅ Submitted!' : 'Submit Score'}
                  </button>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <strong>Demo Mode:</strong> In the real app, scores will save to Firebase and sync across all devices instantly!
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="p-6 space-y-3">
                {weeklyScores.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No scores yet this week!
                  </div>
                ) : (
                  weeklyScores.map((player, index) => (
                    <div
                      key={player.name}
                      className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div
                        className={`text-2xl font-bold w-8 text-center ${
                          index === 0
                            ? 'text-yellow-500'
                            : index === 1
                            ? 'text-gray-400'
                            : index === 2
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="font-semibold">{player.name}</div>
                        <div className="text-xs text-gray-500">
                          Avg: {player.avg} • Streak: {player.streak} {player.streak >= 5 && '🔥'}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-purple-600">{player.totalScore}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Today Tab */}
            {activeTab === 'today' && (
              <div className="p-6">
                {getMissingPlayers().length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      ⏰ Still waiting for (11:30 PM deadline):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getMissingPlayers().map(player => (
                        <span
                          key={player}
                          className="bg-yellow-800 text-white px-3 py-1 rounded-full text-sm"
                        >
                          {player}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-gray-700 mb-4">Today's Scores</h3>

                <div className="space-y-2">
                  {todayScores.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No scores submitted yet today!
                    </div>
                  ) : (
                    todayScores.map(entry => (
                      <div
                        key={entry.id}
                        className="flex items-center p-3 bg-white rounded-lg shadow-sm"
                      >
                        <div
                          className={`w-10 h-10 ${getScoreColor(
                            entry.score
                          )} text-white rounded-lg flex items-center justify-center font-bold`}
                        >
                          {entry.score}
                        </div>
                        <div className="flex-1 ml-4 font-medium">{entry.player}</div>
                        <div className="text-xs text-gray-500">{entry.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-xl text-center">
                  <h3 className="text-sm font-medium mb-1">Next Week's Word Picker</h3>
                  <p className="text-xl font-bold">🎯 Tom</p>
                  <button
                    onClick={() => setShowWordSubmit(!showWordSubmit)}
                    className="mt-2 bg-white text-red-600 px-4 py-2 rounded-full text-sm font-bold"
                  >
                    Submit Starting Word
                  </button>
                </div>

                {showWordSubmit && (
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h4 className="font-semibold mb-2">Submit Starting Word for Week {currentWeek + 1}</h4>
                    <input
                      type="text"
                      value={wordInput}
                      onChange={(e) => setWordInput(e.target.value.toUpperCase())}
                      maxLength={5}
                      placeholder="Enter 5-letter word"
                      className="w-full p-3 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg tracking-widest"
                    />
                    {wordStatus.message && (
                      <div
                        className={`mt-2 p-2 rounded text-sm text-center ${
                          wordStatus.type === 'valid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {wordStatus.message}
                      </div>
                    )}
                    <button
                      onClick={submitWord}
                      className="w-full mt-3 py-3 bg-purple-600 text-white font-bold rounded-lg"
                    >
                      Check & Submit
                    </button>
                  </div>
                )}

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold mb-3">📝 Previous Starting Words</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {usedWords.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2 border-b last:border-0"
                      >
                        <span className="font-bold text-purple-600 tracking-wider">
                          {item.word}
                        </span>
                        <span className="text-xs text-gray-500">
                          Week {item.week} - {item.picker}
                        </span>
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
                      <span className="text-gray-600">Players Today</span>
                      <span className="font-semibold text-purple-600">
                        {todayScores.length} / {players.length}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Week Leader</span>
                      <span className="font-semibold text-purple-600">Emma</span>
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
