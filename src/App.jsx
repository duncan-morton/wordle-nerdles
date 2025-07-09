import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, BarChart3, Users } from 'lucide-react'; // ⬅︎ keep or remove icons as you wish
import {
  collection,
  addDoc,
  Timestamp,
  onSnapshot,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

const WordleNerdlesApp = () => {
  /* ---------------- state ---------------- */
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedScore, setSelectedScore] = useState(null);
  const [showWordSubmit, setShowWordSubmit] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [wordStatus, setWordStatus] = useState({ message: '', type: '' });
  const [submitted, setSubmitted] = useState(false);

  const [players, setPlayers]         = useState([]);
  const [todayScores, setTodayScores] = useState([]);
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [usedWords, setUsedWords]     = useState([]);

  const [loading, setLoading] = useState(true);

  /* ---------------- constants ---------------- */
  const currentWeek     = 12;          // replace with real logic if you store weeks in Firestore
  const currentWordData = { word: 'NONE', picker: 'TBD' };

  /* ---------------- firestore listeners ---------------- */
  useEffect(() => {
    console.log('🔄 Subscribing to Firestore collections…');

    // players
    const unsubPlayers = onSnapshot(collection(db, 'players'), snap => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // today’s scores (you can refine the query e.g. by date)
    const todayQuery = query(
      collection(db, 'scores'),
      where('week', '==', currentWeek),
      orderBy('date', 'desc')
    );
    const unsubToday = onSnapshot(todayQuery, snap => {
      setTodayScores(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          time: d.data().date.toDate().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
        }))
      );
    });

    // weeklyScores – example structure; adapt if you store differently
    const unsubWeekly = onSnapshot(collection(db, 'weeklyScores'), snap => {
      setWeeklyScores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // used starting words
    const unsubWords = onSnapshot(collection(db, 'usedWords'), snap => {
      setUsedWords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // cleanup on unmount
    return () => {
      unsubPlayers();
      unsubToday();
      unsubWeekly();
      unsubWords();
    };
  }, [currentWeek]);

  /* ---------------- helpers ---------------- */
  const getMissingPlayers = () => {
    const submitted = todayScores.map(s => s.player);
    return players.map(p => p.name).filter(n => !submitted.includes(n));
  };

  const getScoreColor = score => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-green-500',
      3: 'bg-yellow-500',
      4: 'bg-yellow-500',
      5: 'bg-orange-500',
      6: 'bg-orange-500',
      X: 'bg-gray-500',
    };
    return colors[score] || 'bg-gray-400';
  };

  /* ---------------- handlers ---------------- */
  const handleScoreSubmit = async () => {
    if (!selectedPlayer || selectedScore === null) return;

    try {
      await addDoc(collection(db, 'scores'), {
        player: selectedPlayer,
        score: selectedScore,
        week: currentWeek,
        date: Timestamp.now(),
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedPlayer('');
        setSelectedScore(null);
      }, 2000);
    } catch (err) {
      console.error(err);
      alert('Error submitting score — check Firebase rules/connection.');
    }
  };

  const submitWord = () => {
    const word = wordInput.toUpperCase();

    if (word.length !== 5)
      return setWordStatus({ message: '❌ Word must be exactly 5 letters', type: 'invalid' });
    if (!/^[A-Z]{5}$/.test(word))
      return setWordStatus({ message: '❌ Word must contain only letters', type: 'invalid' });
    if (usedWords.some(w => w.word === word))
      return setWordStatus({ message: '❌ This word has already been used!', type: 'invalid' });

    // normally save to Firebase here
    setWordStatus({ message: '✅ Word submitted successfully!', type: 'valid' });
    setWordInput('');
    setTimeout(() => {
      setShowWordSubmit(false);
      setWordStatus({ message: '', type: '' });
    }, 2000);
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-black rounded-3xl p-2 shadow-2xl" style={{ height: 812 }}>
        <div className="h-full bg-white rounded-2xl overflow-hidden flex flex-col">
          {/* status bar */}
          <div className="px-6 py-2 flex justify-between text-xs text-gray-600">
            <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
            <span>📶 📷 🔋</span>
          </div>

          {/* header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 text-center">
            <h1 className="text-2xl font-bold mb-1">Wordle Nerdles 🤓</h1>
            <div className="text-sm opacity-90">
              Week {currentWeek} • Started by {currentWordData.picker}
            </div>
            <div className="mt-2 inline-block bg-white/20 px-4 py-1 rounded-full">
              This week's word: <strong>{currentWordData.word}</strong>
            </div>
          </div>

          {/* tabs */}
          <div className="flex bg-gray-50 border-b">
            {['submit', 'leaderboard', 'today', 'stats'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-3 text-sm font-medium capitalize transition-all ${
                  activeTab === t ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* main content */}
          <div className="flex-1 overflow-y-auto">
            {/* ---------------- submit tab ---------------- */}
            {activeTab === 'submit' && (
              <div className="p-6 space-y-4">
                <select
                  value={selectedPlayer}
                  onChange={e => setSelectedPlayer(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg"
                  disabled={loading}
                >
                  <option value="">{loading ? 'Loading players…' : 'Select your name…'}</option>
                  {players.map(p => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <h3 className="text-center text-gray-600 font-medium">Today's Score</h3>

                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button
                      key={n}
                      onClick={() => setSelectedScore(n)}
                      className={`aspect-square text-2xl font-bold rounded-xl border-2 transition-all ${
                        selectedScore === n
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white border-gray-200 hover:border-purple-400'
                      }`}
                    >
                      {n}
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
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {submitted ? '✅ Submitted!' : 'Submit Score'}
                </button>
              </div>
            )}

            {/* ---------------- leaderboard tab ---------------- */}
            {activeTab === 'leaderboard' && (
              <div className="p-6 space-y-3">
                {weeklyScores.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">No scores yet this week!</p>
                ) : (
                  weeklyScores.map((p, i) => (
                    <div
                      key={p.name}
                      className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div
                        className={`text-2xl font-bold w-8 text-center ${
                          ['text-yellow-500', 'text-gray-400', 'text-orange-600'][i] || 'text-gray-600'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          Avg: {p.avg} • Streak: {p.streak} {p.streak >= 5 && '🔥'}
                        </div>
                      </div>
                      <div className="text-xl font-bold text-purple-600">{p.totalScore}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ---------------- today tab ---------------- */}
            {activeTab === 'today' && (
              <div className="p-6">
                {getMissingPlayers().length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">
                      ⏰ Still waiting for (11:30 PM deadline):
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {getMissingPlayers().map(n => (
                        <span key={n} className="bg-yellow-800 text-white px-3 py-1 rounded-full text-sm">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <h3 className="font-semibold text-gray-700 mb-4">Today's Scores</h3>

                <div className="space-y-2">
                  {todayScores.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No scores submitted yet today!</p>
                  ) : (
                    todayScores.map(s => (
                      <div key={s.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
                        <div
                          className={`w-10 h-10 ${getScoreColor(
                            s.score
                          )} text-white rounded-lg flex items-center justify-center font-bold`}
                        >
                          {s.score}
                        </div>
                        <div className="flex-1 ml-4 font-medium">{s.player}</div>
                        <div className="text-xs text-gray-500">{s.time}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ---------------- stats tab ---------------- */}
            {activeTab === 'stats' && (
              <div className="p-6 space-y-4">
                <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-4 rounded-xl text-center">
                  <h3 className="text-sm font-medium">Next Week's Word Picker</h3>
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
                      onChange={e => setWordInput(e.target.value.toUpperCase())}
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
                    <button onClick={submitWord} className="w-full mt-3 py-3 bg-purple-600 text-white font-bold rounded-lg">
                      Check & Submit
                    </button>
                  </div>
                )}

                {/* previous words */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <h3 className="font-semibold mb-3">📝 Previous Starting Words</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {usedWords.map(w => (
                      <div key={w.id} className="flex justify-between items-center py-2 border-b last:border-0">
                        <span className="font-bold text-purple-600 tracking-wider">{w.word}</span>
                        <span className="text-xs text-gray-500">
                          Week {w.week} – {w.picker}
                        </span>
                      </div>
                    ))}
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
