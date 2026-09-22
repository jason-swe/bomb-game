import { useState, useEffect } from 'react';
import React from 'react';
import './App.css';

// HỆ THỐNG ÂM THANH ĐỘC LẬP (Không cần file mp3)
const getAudioCtx = () => {
  if (!window.audioCtxInstance) {
    window.audioCtxInstance = new (window.AudioContext || window.webkitAudioContext)();
  }
  return window.audioCtxInstance;
};

const playTone = (freq, type, duration, vol = 0.1) => {
  try {
    const ctx = getAudioCtx();
    if(ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(e){}
};

export const sounds = {
  correct: () => {
    playTone(880, 'sine', 0.5, 0.15); 
    setTimeout(() => playTone(1108.73, 'sine', 0.8, 0.15), 100);
  },
  wrong: () => {
    playTone(200, 'sawtooth', 0.3, 0.15);
    setTimeout(() => playTone(150, 'sawtooth', 0.4, 0.15), 150);
  },
  explosion: () => {
    try {
      const ctx = getAudioCtx();
      if(ctx.state === 'suspended') ctx.resume();
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const gain = ctx.createGain();
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e){}
  },
  suspense: () => {
    try {
      const ctx = getAudioCtx();
      if(ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 1.8);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch(e){}
  },
  tick: () => {
    playTone(800, 'square', 0.05, 0.03);
  },
  flip: () => {
    playTone(300, 'sine', 0.1, 0.05);
  }
};

const bombConfig = [
  { text: '💥 BOM NỔ -1', desc: 'Trừ ngay 1 điểm. Qua lượt.', type: 'bomb-bad', count: 3, sound: 'explosion' },
  { text: '💣 BOM NỔ -2', desc: 'Trừ ngay 2 điểm. Qua lượt.', type: 'bomb-bad', count: 2, sound: 'explosion' },
  { text: '🪚 CƯA ĐÔI', desc: 'Lập tức chia đôi số điểm hiện tại của đội bốc (làm tròn xuống).', type: 'bomb-bad', count: 1, sound: 'explosion' },
  { text: '☠️ RESET', desc: 'Bay sạch điểm, đưa về số 0 tròn trĩnh.', type: 'bomb-bad', count: 1, sound: 'explosion' },
  { text: '🎁 QUÀ TẶNG +1', desc: 'Lập tức cộng 1 điểm miễn phí.', type: 'bomb-good', count: 2, sound: 'correct' },
  { text: '💎 QUÀ TẶNG +2', desc: 'Lập tức cộng 2 điểm miễn phí.', type: 'bomb-good', count: 2, sound: 'correct' },
  { text: '🎲 ROULETTE NGA', desc: 'Hên xui 50/50: Hãy chọn 1 trong 2 lá bài để định đoạt số phận!', type: 'bomb-action', count: 1, sound: 'suspense' },
  { text: '🥷 ĂN CƯỚP', desc: 'Chỉ định lấy 1 điểm từ 1 đội bất kỳ.', type: 'bomb-action', count: 2, sound: 'explosion' },
  { text: '🔄 ĐỔI VẬN', desc: 'Tráo đổi toàn bộ điểm số hiện tại với 1 đội bất kỳ.', type: 'bomb-action', count: 1, sound: 'correct' },
  { text: '🧤 BÀN TAY THANOS', desc: 'Giáng điểm của đội đang dẫn đầu xuống bằng mức điểm của đội đang bét bảng.', type: 'bomb-action', count: 1, sound: 'explosion' }
];

const questionsData = [
  {
    text: "Chế độ dân chủ nhân dân ở Việt Nam được xác lập sau sự kiện nào?",
    options: ["A. Cách mạng Tháng Mười Nga năm 1917", "B. Cách mạng Tháng Tám năm 1945", "C. Đại hội VI của Đảng năm 1986", "D. Hiến pháp năm 2013"],
    answer: "B"
  },
  {
    text: "Đại hội VI của Đảng (năm 1986) đã nhấn mạnh phát huy dân chủ nhằm mục đích gì?",
    options: ["A. Xây dựng nền kinh tế tư bản chủ nghĩa", "B. Tạo ra động lực mạnh mẽ cho phát triển đất nước", "C. Xóa bỏ hoàn toàn vai trò của Nhà nước", "D. Thay đổi bản chất của chế độ chính trị"],
    answer: "B"
  },
  {
    text: "Theo giáo trình, một trong những đặc trưng của chủ nghĩa xã hội Việt Nam là:",
    options: ["A. Do Nhà nước quản lý toàn bộ xã hội", "B. Do nhân dân làm chủ", "C. Do kinh tế quyết định hoàn toàn", "D. Do thị trường tự điều chỉnh"],
    answer: "B"
  },
  {
    text: "Dân chủ xã hội chủ nghĩa ở Việt Nam được xác định là:",
    options: ["A. Chỉ là một phương thức quản lý xã hội", "B. Chỉ là một mục tiêu chính trị", "C. Bản chất của chế độ, vừa là mục tiêu vừa là động lực phát triển đất nước", "D. Một hình thức tổ chức nhà nước đơn thuần"],
    answer: "C"
  },
  {
    text: "Dân chủ xã hội chủ nghĩa ở Việt Nam phải được gắn liền với yếu tố nào?",
    options: ["A. Cạnh tranh kinh tế", "B. Kỷ luật, kỷ cương và pháp luật", "C. Quyền lực cá nhân", "D. Lợi ích riêng của từng nhóm xã hội"],
    answer: "B"
  },
  {
    text: "Bản chất của nền dân chủ xã hội chủ nghĩa ở Việt Nam dựa vào:",
    options: ["A. Sự phát triển tự do của thị trường", "B. Nhà nước xã hội chủ nghĩa và sự ủng hộ, giúp đỡ của nhân dân", "C. Hoạt động của các tổ chức kinh tế", "D. Quyền lực của một nhóm xã hội"],
    answer: "B"
  },
  {
    text: "Theo giáo trình, quyền làm chủ của nhân dân được hiểu là:",
    options: ["A. Nhân dân chỉ tham gia đóng góp ý kiến", "B. Mọi quyền lực đều thuộc về nhân dân, dân là gốc, dân làm chủ", "C. Nhân dân chỉ thực hiện nghĩa vụ với Nhà nước", "D. Nhân dân không tham gia quản lý xã hội"],
    answer: "B"
  },
  {
    text: "Dân chủ xã hội chủ nghĩa ở Việt Nam được thực hiện thông qua những hình thức nào?",
    options: ["A. Dân chủ kinh tế và dân chủ văn hóa", "B. Dân chủ tập trung và dân chủ tự do", "C. Dân chủ trực tiếp và dân chủ gián tiếp", "D. Dân chủ nhà nước và dân chủ thị trường"],
    answer: "C"
  },
  {
    text: "Hình thức dân chủ gián tiếp được thực hiện thông qua việc:",
    options: ["A. Nhân dân trực tiếp quyết định mọi vấn đề", "B. Nhân dân ủy quyền cho tổ chức, cá nhân do mình bầu ra", "C. Nhà nước tự quyết định các vấn đề xã hội", "D. Các tổ chức kinh tế quản lý xã hội"],
    answer: "B"
  },
  {
    text: "Quốc hội Việt Nam được xác định là:",
    options: ["A. Cơ quan hành pháp cao nhất", "B. Cơ quan quyền lực nhà nước cao nhất", "C. Cơ quan tư pháp cao nhất", "D. Cơ quan kinh tế cao nhất"],
    answer: "B"
  },
  {
    text: "Phương châm thực hiện dân chủ ở cơ sở được nêu trong giáo trình là:",
    options: ["A. Dân nghe, dân hiểu, dân làm", "B. Dân biết, dân bàn, dân làm, dân kiểm tra", "C. Dân quản lý, dân quyết định, dân thực hiện", "D. Dân kiểm tra, Nhà nước quyết định"],
    answer: "B"
  },
  {
    text: "Nhà nước pháp quyền nói chung được hiểu là nhà nước:",
    options: ["A. Quản lý xã hội bằng quyền lực cá nhân", "B. Thượng tôn pháp luật, hướng tới phúc lợi cho mọi người", "C. Không cần có sự phân công quyền lực", "D. Không chịu sự giám sát của nhân dân"],
    answer: "B"
  },
  {
    text: "Một trong những nội dung xây dựng Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam là:",
    options: ["A. Đề cao vai trò tối thượng của Hiến pháp và pháp luật", "B. Giảm quyền tham gia của công dân", "C. Loại bỏ sự kiểm soát quyền lực", "D. Tập trung toàn bộ quyền lực vào một cơ quan"],
    answer: "A"
  },
  {
    text: "Theo giáo trình, Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam có đặc điểm:",
    options: ["A. Nhà nước của dân, do dân, vì dân", "B. Nhà nước chỉ phục vụ cơ quan quản lý", "C. Nhà nước không cần pháp luật điều chỉnh", "D. Nhà nước đứng ngoài xã hội"],
    answer: "A"
  },
  {
    text: "Trong Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam, pháp luật được đặt ở vị trí:",
    options: ["A. Tham khảo", "B. Tối thượng", "C. Không bắt buộc", "D. Thứ yếu"],
    answer: "B"
  },
  {
    text: "Quyền lực nhà nước ở Việt Nam được xác định là:",
    options: ["A. Chia tách hoàn toàn giữa các cơ quan", "B. Thống nhất, có sự phân công, phối hợp và kiểm soát", "C. Thuộc riêng một cơ quan duy nhất", "D. Không cần kiểm soát"],
    answer: "B"
  },
  {
    text: "Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam chịu sự lãnh đạo của:",
    options: ["A. Các tổ chức kinh tế", "B. Đảng Cộng sản Việt Nam", "C. Các tổ chức xã hội tự quản", "D. Các doanh nghiệp nhà nước"],
    answer: "B"
  },
  {
    text: "Một đặc điểm của Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam là:",
    options: ["A. Không quan tâm đến quyền con người", "B. Coi con người là chủ thể, trung tâm của sự phát triển", "C. Hạn chế quyền dân chủ của nhân dân", "D. Không cần sự giám sát của nhân dân"],
    answer: "B"
  }
];

const revIcons = ['★', '☭', '★', '☭'];

function App() {
  const [cells, setCells] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scores, setScores] = useState({ A: 0, B: 0 });
  const [activeTeam, setActiveTeam] = useState(null);
  const [teamNotice, setTeamNotice] = useState('');
  const [targetTeam, setTargetTeam] = useState(null);

  // States cho Roulette Nga
  const [rouletteCards, setRouletteCards] = useState([]);
  const [rouletteChoiceIndex, setRouletteChoiceIndex] = useState(null); 
  const [bombEffect, setBombEffect] = useState('');

  // States cho Câu hỏi
  const [timeLeft, setTimeLeft] = useState(30);
  const [clickedOptions, setClickedOptions] = useState([]);
  const [isQuestionSolved, setIsQuestionSolved] = useState(false);
  const [isBombRevealed, setIsBombRevealed] = useState(false);

  const updateTeamScore = (team, change) => {
    setScores(prev => ({
      ...prev,
      [team]: Math.max(0, prev[team] + change)
    }));
  };

  const applyBombEffect = (card) => {
    if (card.label === '💥 BOM NỔ -1') updateTeamScore(activeTeam, -1);
    else if (card.label === '💣 BOM NỔ -2') updateTeamScore(activeTeam, -2);
    else if (card.label === '🪚 CƯA ĐÔI') {
      setScores(prev => ({ ...prev, [activeTeam]: Math.floor(prev[activeTeam] / 2) }));
    } else if (card.label === '☠️ RESET') {
      setScores(prev => ({ ...prev, [activeTeam]: 0 }));
    } else if (card.label === '🎁 QUÀ TẶNG +1') updateTeamScore(activeTeam, 1);
    else if (card.label === '💎 QUÀ TẶNG +2') updateTeamScore(activeTeam, 2);
    else if (card.label === '🧤 BÀN TAY THANOS') {
      setScores(prev => {
        const highestScore = Math.max(prev.A, prev.B);
        const lowestScore = Math.min(prev.A, prev.B);
        if (highestScore === lowestScore) return prev;
        const leadingTeam = prev.A > prev.B ? 'A' : 'B';
        return { ...prev, [leadingTeam]: lowestScore };
      });
    }
  };

  // Khởi tạo ma trận
  useEffect(() => {
    let initialCells = [];
    for (let i = 1; i <= 18; i++) {
      initialCells.push({ 
        id: `Q${i}`, 
        label: `CÂU SỐ ${i}`,
        content: questionsData[i - 1],
        type: 'question', 
        isOpened: false,
        frontIcon: revIcons[Math.floor(Math.random() * revIcons.length)],
        sound: '/question.mp3'
      });
    }

    bombConfig.forEach((bomb, bIdx) => {
      for (let i = 0; i < bomb.count; i++) {
        initialCells.push({ 
          id: `B_${bIdx}_${i}`, 
          label: bomb.text,
          content: bomb.desc, 
          type: bomb.type, 
          isOpened: false,
          frontIcon: revIcons[Math.floor(Math.random() * revIcons.length)],
          sound: bomb.sound
        });
      }
    });

    const giftBombs = bombConfig.filter(bomb => (
      bomb.text === '🎁 QUÀ TẶNG +1' || bomb.text === '💎 QUÀ TẶNG +2'
    ));
    for (let i = 0; i < 2; i++) {
      const gift = giftBombs[Math.floor(Math.random() * giftBombs.length)];
      initialCells.push({
        id: `BONUS_GIFT_${i}`,
        label: gift.text,
        content: gift.desc,
        type: gift.type,
        isOpened: false,
        frontIcon: revIcons[Math.floor(Math.random() * revIcons.length)],
        sound: gift.sound
      });
    }

    for (let i = initialCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initialCells[i], initialCells[j]] = [initialCells[j], initialCells[i]];
    }

    setCells(initialCells);
  }, []);

  // Timer cho câu hỏi
  useEffect(() => {
    let timerId;
    if (selectedCard?.type === 'question' && timeLeft > 0 && !isQuestionSolved) {
      timerId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 6 && prev > 1) sounds.tick();
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [selectedCard, timeLeft, isQuestionSolved]);

  const handleCellClick = (index) => {
    if (!activeTeam) {
      setTeamNotice('Hãy chọn Đội A hoặc Đội B trước khi chọn thẻ.');
      return;
    }

    const newCells = [...cells];
    let clickedCell = { ...newCells[index] };
    
    if (clickedCell.isOpened) return; 

    sounds.flip();

    setTimeLeft(30);
    setClickedOptions([]);
    setIsQuestionSolved(false);
    setBombEffect('');
    setTargetTeam(null);
    setTeamNotice('');

    clickedCell.isOpened = true;
    newCells[index] = clickedCell;
    setCells(newCells);
    setSelectedCard(clickedCell);

    if (clickedCell.type !== 'question') {
      setIsBombRevealed(false);
      sounds.suspense();

      setTimeout(() => {
        setIsBombRevealed(true);
        if (clickedCell.label === '🎲 ROULETTE NGA') {
          const options = [
            { value: 3, msg: 'MAY MẮN! (+3 ĐIỂM)' },
            { value: -3, msg: 'XUI XẺO! (-3 ĐIỂM)' }
          ];
          if (Math.random() > 0.5) options.reverse();
          setRouletteCards(options);
          setRouletteChoiceIndex(null);
          setBombEffect('effect-roulette');
        } else {
          if (sounds[clickedCell.sound]) sounds[clickedCell.sound]();
          
          if (clickedCell.label.includes('THANOS')) setBombEffect('effect-thanos');
          else if (clickedCell.label.includes('CƯA ĐÔI')) setBombEffect('effect-chainsaw');
          else if (clickedCell.label.includes('RESET')) setBombEffect('effect-reset');
          else if (clickedCell.label.includes('ĂN CƯỚP')) setBombEffect('effect-steal');

          applyBombEffect(clickedCell);
          if (clickedCell.type === 'bomb-good') {
            setTimeout(() => window.confetti && window.confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 10000 }), 300);
          }
        }
      }, 1800); // 1.8s suspense
    } else {
      sounds.flip();
    }
  };

  const handleRouletteChoice = (idx) => {
    if (rouletteChoiceIndex !== null) return; 
    setRouletteChoiceIndex(idx);
    
    const choice = rouletteCards[idx];
    updateTeamScore(activeTeam, choice.value);
    if (choice.value > 0) {
      setTimeout(() => window.confetti && window.confetti({ particleCount: 300, spread: 100, origin: { y: 0.5 }, zIndex: 10000 }), 100);
      sounds.correct();
    } else {
      sounds.explosion();
    }
  };

  const handleOptionClick = (optIndex, isCorrect) => {
    if (timeLeft === 0 || isQuestionSolved) return;
    if (clickedOptions.includes(optIndex)) return;

    const newClicked = [...clickedOptions, optIndex];
    setClickedOptions(newClicked);

    if (isCorrect) {
      setIsQuestionSolved(true);
      updateTeamScore(activeTeam, 1);
      sounds.correct();
      setTimeout(() => window.confetti && window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#ffff00', '#00ff00'], zIndex: 10000 }), 100);
    } else {
      sounds.wrong();
    }
  };

  const handleTargetTeam = (team) => {
    if (team === activeTeam || targetTeam !== null) return;

    setTargetTeam(team);
    if (selectedCard.label === '🥷 ĂN CƯỚP') {
      setScores(prev => {
        const stolenPoints = Math.min(1, prev[team]);
        return {
          ...prev,
          [activeTeam]: prev[activeTeam] + stolenPoints,
          [team]: prev[team] - stolenPoints
        };
      });
    } else if (selectedCard.label === '🔄 ĐỔI VẬN') {
      setScores(prev => ({
        ...prev,
        [activeTeam]: prev[team],
        [team]: prev[activeTeam]
      }));
    }
  };

  const closeModal = () => {
    setSelectedCard(null);
    setBombEffect('');
    setActiveTeam(null);
    setTargetTeam(null);
  };

  const colHeaders = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rowHeaders = ['1', '2', '3', '4', '5', '6'];

  const renderGoldenIcon = (icon) => (
    <div className="golden-icon-wrapper">
      <span className="golden-icon-text">{icon}</span>
    </div>
  );

  return (
    <div className="app-container">
      
      <div className="title-container slide-in-top">
        <h1 className="game-title">CHIẾN DỊCH LẬT MỞ</h1>
        <div className="subtitle-badge bounce-anim">TỰ HÀO VIỆT NAM</div>
      </div>

      <div className="score-panel fade-in-up">
        <div className="score-heading">BẢNG ĐIỂM</div>
        <div className="team-buttons">
          {['A', 'B'].map(team => (
            <button
              key={team}
              className={`team-card ${activeTeam === team ? 'selected' : ''}`}
              onClick={() => {
                if (!selectedCard) {
                  setActiveTeam(team);
                  setTeamNotice('');
                }
              }}
              disabled={Boolean(selectedCard)}
            >
              <span className="team-name">ĐỘI {team}</span>
              <strong className="team-score">{scores[team]}</strong>
              {activeTeam === team && <span className="turn-label">ĐANG CHƠI</span>}
            </button>
          ))}
        </div>
        <div className="turn-instruction">
          {activeTeam ? `Lượt của Đội ${activeTeam}. Hãy chọn một thẻ trên bảng.` : 'Chọn đội trước khi chọn thẻ.'}
        </div>
        {teamNotice && <div className="team-notice">{teamNotice}</div>}
      </div>
      
      <div className="board-wrapper fade-in-up">
        <div className="grid-container">
          <div className="header-cell empty"></div>
          {colHeaders.map(h => (
            <div className="header-cell col-header" key={h}>{h}</div>
          ))}

          {rowHeaders.map((r, rIndex) => (
            <React.Fragment key={r}>
              <div className="header-cell row-header">{r}</div>
              
              {cells.slice(rIndex * 6, (rIndex + 1) * 6).map((cell, cIndex) => {
                const index = rIndex * 6 + cIndex;
                return (
                  <div 
                    key={cell.id}
                    className={`cell-wrapper deal-anim hover-jiggle ${cell.isOpened ? 'opened' : ''}`}
                    style={{ animationDelay: `${index * 0.03}s` }}
                    onClick={() => handleCellClick(index)}
                  >
                    <div className="cell-inner">
                      <div className="cell-front">
                        <div className="cell-index">{renderGoldenIcon(cell.frontIcon)}</div>
                      </div>
                      <div className={`cell-back ${cell.type}`}>
                        <div className="card-icon-massive">
                          {cell.type === 'question' ? renderGoldenIcon('★') : renderGoldenIcon('💣')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* MODAL CẢI TIẾN (NEW UI) */}
      {selectedCard && (
        <div className={`modal-overlay ${bombEffect}`} onClick={closeModal}>
          
          {/* HIỆU ỨNG BOM */}
          {isBombRevealed && bombEffect === 'effect-thanos' && <div className="thanos-dust"></div>}
          {isBombRevealed && bombEffect === 'effect-chainsaw' && <div className="chainsaw-blade"></div>}
          {isBombRevealed && bombEffect === 'effect-reset' && <div className="reset-flash"></div>}
          {isBombRevealed && bombEffect === 'effect-steal' && <div className="ninja-slash"></div>}

          {selectedCard.type === 'question' ? (
            <div className="modal-card-modern fade-in-up" onClick={(e) => e.stopPropagation()}>
              {/* HEADER */}
              <div className="m-header">
                <div className="m-badges">
                  <span className="m-badge-primary">{selectedCard.label}</span>
                  <span className="m-badge-outline">TRẮC NGHIỆM</span>
                </div>
                <button className="m-close-btn" onClick={closeModal}>✕</button>
              </div>

              {/* BODY */}
              <div className="m-body">
                <div className="question-ui-modern">
                  <div className="timer-wrapper">
                    <div className={`timer-circle ${timeLeft <= 10 && !isQuestionSolved && timeLeft > 0 ? 'urgent' : ''} ${timeLeft === 0 && !isQuestionSolved ? 'time-up' : ''}`}>
                      <span className="timer-num">{timeLeft}</span>
                      <span className="timer-unit">GIÂY</span>
                    </div>
                  </div>
                  <h2 className="m-question-text">{selectedCard.content.text}</h2>
                  
                  <div className="m-options-box">
                    <div className="m-options-title">ĐÁP ÁN:</div>
                    <div className="m-options-grid">
                      {selectedCard.content.options.map((opt, i) => {
                        const isCorrect = opt.startsWith(selectedCard.content.answer);
                        const isClicked = clickedOptions.includes(i);
                        const isTimeUp = timeLeft === 0;
                        
                        let optClass = '';
                        if (isClicked) {
                          optClass = isCorrect ? 'correct-answer bounce-anim' : 'wrong-answer shake-anim';
                        } else if ((isQuestionSolved || isTimeUp) && isCorrect) {
                          optClass = 'correct-answer bounce-anim';
                        } else if (isQuestionSolved || isTimeUp) {
                          optClass = 'dimmed';
                        }

                        return (
                          <div 
                            key={i} 
                            className={`m-option-item ${optClass} ${(isQuestionSolved || isTimeUp) ? 'disabled' : ''}`}
                            onClick={() => handleOptionClick(i, isCorrect)}
                          >
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="m-footer">
                  <button className="m-btn-primary" onClick={closeModal}>
                    ĐÓNG THẺ CÂU HỎI
                  </button>
              </div>
            </div>
          ) : (
            /* 3D BOMB CARD LAYOUT */
            <div className="bomb-card-wrapper" onClick={(e) => e.stopPropagation()}>
               {!isBombRevealed && (
                 <h2 className="suspense-text blink-anim">CÙNG CHỜ XEM...</h2>
               )}
               <div className={`bomb-card-3d ${!isBombRevealed ? 'suspense-intro' : 'is-flipped'}`}>
                  
                  <div className="bomb-card-front">
                     <div className="star-3d">★</div>
                  </div>
                  
                  <div className="bomb-card-back">
                     {selectedCard.label === '🎲 ROULETTE NGA' ? (
                       <div className="roulette-ui-modern">
                         <h2 className="m-title-text">{selectedCard.label}</h2>
                         <p className="m-desc-text" style={{fontSize: '1rem'}}>{selectedCard.content}</p>
                         
                         <div className="roulette-cards-modern" style={{marginTop: '20px'}}>
                           {rouletteCards.map((card, idx) => {
                             const isRevealed = rouletteChoiceIndex === idx;
                             const isUnchosen = rouletteChoiceIndex !== null && rouletteChoiceIndex !== idx;
                             return (
                               <div 
                                 key={idx} 
                                 className={`rc-card ${isRevealed ? 'revealed' : ''} ${isUnchosen ? 'unchosen' : ''}`}
                                 onClick={() => handleRouletteChoice(idx)}
                               >
                                 <div className="rc-inner">
                                   <div className="rc-front">?</div>
                                   <div className={`rc-back ${card.value > 0 ? 'good' : 'bad'}`}>
                                     {card.msg}
                                   </div>
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     ) : (
                       <div className="bomb-ui-modern" style={{width: '100%'}}>
                         <h1 className="m-bomb-title" style={{fontSize: '2.5rem', marginBottom: '20px'}}>{selectedCard.label}</h1>
                         <div className="m-bomb-desc-box" style={{border: 'none', padding: '0'}}>
                           <p className="m-desc-text" style={{fontSize: '1.2rem'}}>{selectedCard.content}</p>
                           {['🥷 ĂN CƯỚP', '🔄 ĐỔI VẬN'].includes(selectedCard.label) && (
                             <div className="target-team-box">
                               <p className="target-team-title">Chọn đội còn lại:</p>
                               <div className="target-team-buttons">
                                 {['A', 'B'].filter(team => team !== activeTeam).map(team => (
                                   <button
                                     key={team}
                                     className={`target-team-btn ${targetTeam === team ? 'selected' : ''}`}
                                     onClick={() => handleTargetTeam(team)}
                                     disabled={targetTeam !== null}
                                   >
                                     ĐỘI {team}
                                   </button>
                                 ))}
                               </div>
                               {targetTeam && <p className="target-team-result">Đã áp dụng cho Đội {targetTeam}.</p>}
                             </div>
                           )}
                         </div>
                       </div>
                     )}
                     
                     {isBombRevealed && (
                       <button className="m-btn-primary" style={{marginTop: '30px'}} onClick={closeModal}>
                         ĐÃ HIỂU & ĐÓNG
                       </button>
                     )}
                  </div>

               </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default App;