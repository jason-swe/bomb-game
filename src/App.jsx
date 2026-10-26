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
  { text: '🪚 CƯA ĐÔI', desc: 'Lập tức chia đôi số điểm hiện tại của nhóm bốc (làm tròn xuống).', type: 'bomb-bad', count: 1, sound: 'explosion' },
  { text: '☠️ RESET', desc: 'Bay sạch điểm, đưa về số 0 tròn trĩnh.', type: 'bomb-bad', count: 1, sound: 'explosion' },
  { text: '🎁 QUÀ TẶNG +1', desc: 'Lập tức cộng 1 điểm miễn phí.', type: 'bomb-good', count: 2, sound: 'correct' },
  { text: '💎 QUÀ TẶNG +2', desc: 'Lập tức cộng 2 điểm miễn phí.', type: 'bomb-good', count: 2, sound: 'correct' },
  { text: '🎲 ROULETTE NGA', desc: 'Hên xui 50/50: Hãy chọn 1 trong 2 lá bài để định đoạt số phận!', type: 'bomb-action', count: 1, sound: 'suspense' },
  { text: '🥷 ĂN CƯỚP', desc: 'Chỉ định lấy 1 điểm từ 1 nhóm bất kỳ.', type: 'bomb-action', count: 2, sound: 'explosion' },
  { text: '🔄 ĐỔI VẬN', desc: 'Tráo đổi toàn bộ điểm số hiện tại với 1 nhóm bất kỳ.', type: 'bomb-action', count: 1, sound: 'correct' },
  { text: '🧤 BÀN TAY THANOS', desc: 'Giáng điểm của nhóm đang dẫn đầu xuống bằng mức điểm của nhóm đang bét bảng.', type: 'bomb-action', count: 1, sound: 'explosion' }
];

const questionsData = [
  {
    text: "Theo Trung ương, sự kết thúc cách mạng dân tộc dân chủ nhân dân ở miền Bắc cũng là:",
    options: ["A. Sự mở đầu của cách mạng xã hội chủ nghĩa", "B. Sự kết thúc thời kỳ quá độ", "C. Sự mở đầu kháng chiến chống Mỹ", "D. Sự hoàn thành thống nhất đất nước"],
    answer: "A"
  },
  {
    text: "Sau năm 1954, ai trở thành kẻ thù trực tiếp của nhân dân Việt Nam?",
    options: ["A. Thực dân Pháp", "B. Phát xít Nhật", "C. Đế quốc Mỹ", "D. Quân Tưởng Giới Thạch"],
    answer: "C"
  },
  {
    text: "Đến 7/1956, cải cách ruộng đất đã chia cho hơn 2 triệu hộ nông dân bao nhiêu ruộng đất?",
    options: ["A. Hơn 81.000 ha", "B. Hơn 810.000 ha", "C. Hơn 1,8 triệu ha", "D. Hơn 500.000 ha"],
    answer: "B"
  },
  {
    text: "Hội nghị nào nghiêm khắc kiểm điểm, công khai tự phê bình và sửa sai trong cải cách ruộng đất?",
    options: ["A. Hội nghị Trung ương 7 (3/1955)", "B. Hội nghị Trung ương 14 (11/1958)", "C. Hội nghị Trung ương 16 (4/1959)", "D. Hội nghị Trung ương 10 khóa II (9/1956)"],
    answer: "D"
  },
  {
    text: "Nguyên nhân của sai lầm trong cải cách ruộng đất là:",
    options: ["A. Chủ quan, giáo điều, không xuất phát từ thực tiễn", "B. Thiếu cán bộ thực hiện", "C. Do địch phá hoại", "D. Thiếu kinh phí"],
    answer: "A"
  },
  {
    text: "Ba nguyên tắc hợp tác hóa nông nghiệp (Hội nghị Trung ương 16, 4/1959) là:",
    options: ["A. Tập trung, bình đẳng, công khai", "B. Tự giác, tự quản, tự chịu trách nhiệm", "C. Tự nguyện, cùng có lợi, quản lý dân chủ", "D. Đoàn kết, dân chủ, kỷ luật"],
    answer: "C"
  },
  {
    text: "Đối với tư sản, Đảng chủ trương cải tạo theo hướng nào?",
    options: ["A. Tịch thu toàn bộ tài sản", "B. Cải tạo hòa bình qua hình thức công tư hợp doanh", "C. Đánh thuế cao để giải thể", "D. Giữ nguyên, không cải tạo"],
    answer: "B"
  },
  {
    text: "Tháng 10/1954, Xứ ủy Nam Bộ được thành lập. Ai làm Bí thư?",
    options: ["A. Trường Chinh", "B. Phạm Văn Đồng", "C. Nguyễn Văn Linh", "D. Lê Duẩn"],
    answer: "D"
  },
  {
    text: "Nghị quyết Trung ương 15 (1/1959) xác định con đường cách mạng miền Nam là:",
    options: ["A. Sử dụng bạo lực cách mạng, kết hợp đấu tranh chính trị với đấu tranh quân sự", "B. Chỉ đấu tranh chính trị, đòi hiệp thương tổng tuyển cử", "C. Chờ tổng tuyển cử theo Hiệp định Giơnevơ", "D. Đấu tranh ngoại giao là chủ yếu"],
    answer: "A"
  },
  {
    text: "Phong trào Đồng khởi bùng nổ ngày 17/1/1960 ở đâu?",
    options: ["A. Trà Bồng (Quảng Ngãi)", "B. Bác Ái (Ninh Thuận)", "C. Mỏ Cày (Bến Tre)", "D. Tân Lập (Tây Ninh)"],
    answer: "C"
  },
  {
    text: "Tính đến cuối năm 1960, phong trào Đồng khởi đạt được kết quả gì về chính quyền tự quản?",
    options: ["A. 1.283/2.627 xã do nhân dân lập chính quyền tự quản", "B. 1.383/2.627 xã do nhân dân lập chính quyền tự quản", "C. 1.483/2.627 xã do nhân dân lập chính quyền tự quản", "D. 1.583/2.627 xã do nhân dân lập chính quyền tự quản"],
    answer: "B"
  },
  {
    text: "Mặt trận Dân tộc giải phóng miền Nam Việt Nam ra đời vào ngày nào?",
    options: ["A. 17/1/1960", "B. 20/12/1960", "C. 19/5/1959", "D. 1/11/1963"],
    answer: "B"
  },
  {
    text: "Theo Đại hội III, cách mạng xã hội chủ nghĩa ở miền Bắc giữ vai trò gì?",
    options: ["A. Quyết định trực tiếp", "B. Hỗ trợ", "C. Thứ yếu", "D. Quyết định nhất"],
    answer: "D"
  },
  {
    text: "Tháng 3/1964 gắn với phong trào thi đua nào ở miền Bắc?",
    options: ["A. “Ba nhất”", "B. Hợp tác xã Đại Phong", "C. “Mỗi người làm việc bằng hai để đền đáp lại cho đồng bào miền Nam ruột thịt”", "D. Nhà máy cơ khí Duyên Hải"],
    answer: "C"
  },
  {
    text: "Công thức của chiến lược “Chiến tranh đặc biệt” là:",
    options: ["A. Cố vấn, vũ khí Mỹ và quân chủ lực Việt Nam Cộng hòa", "B. Quân Mỹ trực tiếp tham chiến", "C. Không quân Mỹ đánh phá miền Bắc", "D. Quân đồng minh thay thế quân Mỹ"],
    answer: "A"
  },
  {
    text: "Từ ngày nào Mỹ bắt đầu rải chất độc dioxin xuống miền Nam Việt Nam?",
    options: ["A. 15/2/1961", "B. 2/1/1963", "C. 10/8/1961", "D. 20/12/1960"],
    answer: "C"
  },
  {
    text: "Tháng 10/1961, tổ chức nào được thành lập để lãnh đạo trực tiếp cách mạng miền Nam?",
    options: ["A. Xứ ủy Nam Bộ", "B. Mặt trận Dân tộc giải phóng miền Nam Việt Nam", "C. Quân giải phóng miền Nam Việt Nam", "D. Trung ương Cục miền Nam"],
    answer: "D"
  },
  {
    text: "Ngày 2/1/1963 gắn với chiến thắng nào?",
    options: ["A. Bình Giã", "B. Ấp Bắc", "C. Ba Gia", "D. Đồng Xoài"],
    answer: "B"
  }
];

const revIcons = ['★', '☭', '★', '☭'];
const teams = ['1', '3', '4', '5', '6', '7'];

function App() {
  const [cells, setCells] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [scores, setScores] = useState(
    Object.fromEntries(teams.map(team => [team, 0]))
  );
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
        const scoreValues = teams.map(team => prev[team]);
        const highestScore = Math.max(...scoreValues);
        const lowestScore = Math.min(...scoreValues);
        if (highestScore === lowestScore) return prev;
        const leadingTeam = teams.find(team => prev[team] === highestScore);
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
      setTeamNotice('Hãy chọn một nhóm từ Nhóm 1, 3, 4, 5, 6 hoặc 7 trước khi chọn thẻ.');
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
          {teams.map(team => (
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
              <span className="team-name">NHÓM {team}</span>
              <strong className="team-score">{scores[team]}</strong>
              {activeTeam === team && <span className="turn-label">ĐANG CHƠI</span>}
            </button>
          ))}
        </div>
        <div className="turn-instruction">
          {activeTeam ? `Lượt của Nhóm ${activeTeam}. Hãy chọn một thẻ trên bảng.` : 'Chọn nhóm trước khi chọn thẻ.'}
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
                        const isCorrect = Boolean(selectedCard.content.answer) && opt.startsWith(selectedCard.content.answer);
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
                               <p className="target-team-title">Chọn nhóm còn lại:</p>
                               <div className="target-team-buttons">
                                 {teams.filter(team => team !== activeTeam).map(team => (
                                   <button
                                     key={team}
                                     className={`target-team-btn ${targetTeam === team ? 'selected' : ''}`}
                                     onClick={() => handleTargetTeam(team)}
                                     disabled={targetTeam !== null}
                                   >
                                     NHÓM {team}
                                   </button>
                                 ))}
                               </div>
                               {targetTeam && <p className="target-team-result">Đã áp dụng cho Nhóm {targetTeam}.</p>}
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