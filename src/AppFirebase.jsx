import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, BarChart3, Users } from 'lucide-react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

const WordleNerdlesApp = () => {
  const [activeTab, setActiveTab] = useState('submit');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedScore, setSelectedScore] = useState(null);
  const [showWordSubmit, setShowWordSubmit] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [wordStatus, setWordStatus] = useState({ message: '', type: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Firebase data states
  const [players, setPlayers] = useState([]);
  const [todayScores, setTodayScores] = useState([]);
  const [weeklyScores, setWeeklyScores] = useState([]);
  const [usedWords, setUsedWords] = useState([]);
  const [currentWeekData, setCurrentWeekData] = useState({
    word: 'CRANE',
    picker: 'Sarah'
  });

  const currentWeek = 12;

  // Load players from Firebase
  useEffect(() => {
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

  // Load today's scores
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const scoresRef = collection(db, 'scores');
    const q = query(
      scoresRef,
      where('date', '>=', Timestamp.fromDate(today)),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().date.toDate().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        })
      }));
      setTodayScores(scores);
    });

    return () => unsubscribe();
  }, []);

  // Submit score to Firebase
  const handleScoreSubmit = async () => {
    if (!selectedPlayer || selectedScore === null) return;

    try {
      await addDoc(collection(db, 'scores'), {
        player: selectedPlayer,
        score: selectedScore,
        week: currentWeek,
        date: Timestamp.now()
      });

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedPlayer('');
        setSelectedScore(null);
      }, 2000);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Error submitting score. Please try again.');
    }
  };

  // Rest of your component code stays the same...
  // (I'll continue in the next message due to length)