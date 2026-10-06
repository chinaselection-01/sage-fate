/* SageFate BaZi engine + report renderer
 * Usage (browser): after lunar.js loads,
 *   var r = SageFate.computeChart(solar, lunar, ec, gender, name, nowYear);
 *   document.getElementById('report').innerHTML = SageFate.renderReport(r);
 * Node test: module.exports works the same. */
(function (root) {
  'use strict';

  /* ---------- static data ---------- */
  var GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var GAN_YANG = [1,0,1,0,1,0,1,0,1,0]; // 1=Yang
  var GAN_WX  = ['木','木','火','火','土','土','金','金','水','水'];
  var ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var ZHI_WX = ['水','土','木','木','土','火','火','土','金','金','土','水'];
  var ZHI_ANI = ['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
  var WX_EN = {'金':'Metal','木':'Wood','水':'Water','火':'Fire','土':'Earth'};
  var WX_EMOJI = {'金':'💠','木':'🌳','水':'💧','火':'🔥','土':'⛰️'};
  var WX_KEY = ['金','木','水','火','土'];
  var SHI_EN = {'比肩':'Peer','劫财':'Rival','食神':'Talent','伤官':'Output','偏财':'Side Wealth','正财':'Direct Wealth','七杀':'Seven Killings','正官':'Officer','偏印':'Owl Seal','正印':'Resource Seal','日主':'Day Master'};
  var XIU_WX = {'角':'木','亢':'金','氐':'土','房':'土','心':'火','尾':'火','箕':'水','斗':'木','牛':'金','女':'土','虚':'土','危':'土','室':'火','壁':'水','奎':'木','娄':'金','胃':'土','昴':'金','觜':'火','参':'金','井':'木','鬼':'金','柳':'土','星':'火','张':'火','翼':'火','轸':'水'};
  var WX_SCORE_W = [10, 9, 5, 3]; // stem, hidden main, middle, remnant

  // season by month branch
  function seasonOf(branch){
    var i = ZHI.indexOf(branch);
    if (i===2||i===3) return '春';
    if (i===5||i===6) return '夏';
    if (i===8||i===9) return '秋';
    if (i===0||i===11) return '冬';
    return '四季'; // 辰戌丑未
  }
  var STATE = { // 旺相休囚死
    '春':{'木':'旺','火':'相','水':'休','金':'囚','土':'死'},
    '夏':{'火':'旺','土':'相','木':'休','水':'囚','金':'死'},
    '秋':{'金':'旺','水':'相','土':'休','火':'囚','木':'死'},
    '冬':{'水':'旺','木':'相','金':'休','土':'囚','火':'死'},
    '四季':{'土':'旺','金':'相','火':'休','木':'囚','水':'死'}
  };
  var STATE_EN = {'旺':'thriving','相':'strong','休':'resting','囚':'trapped','死':'weakened'};
  var SEASON_EN = {'春':'spring','夏':'summer','秋':'autumn','冬':'winter','四季':'the last month of the season (Earth)'};

  var SHENG = {'木':'火','火':'土','土':'金','金':'水','水':'木'}; // I generate
  var KE = {'木':'土','土':'水','水':'火','火':'金','金':'木'};    // I control

  function tenGodEn(dayGan, tGan){
    var a = GAN.indexOf(dayGan), b = GAN.indexOf(tGan);
    var dw = GAN_WX[a], tw = GAN_WX[b];
    var sameYY = GAN_YANG[a] === GAN_YANG[b];
    if (dw === tw) return sameYY ? 'Peer (比肩)' : 'Rival (劫财)';
    if (SHENG[dw] === tw) return sameYY ? 'Talent (食神)' : 'Output (伤官)';
    if (KE[dw] === tw) return sameYY ? 'Side Wealth (偏财)' : 'Direct Wealth (正财)';
    if (KE[tw] === dw) return sameYY ? 'Seven Killings (七杀)' : 'Officer (正官)';
    return sameYY ? 'Owl Seal (偏印)' : 'Resource Seal (正印)';
  }
  function yearGZ(y){ var i=(y-4)%60; if(i<0)i+=60; return GAN[i%10] + ZHI[i%12]; }

  /* day-master personality copy */
  var PERSONA = {
    '甲':{name:'Jia — Yang Wood 甲木', sym:'the towering tree — upright, pioneering, unyielding', imp:'dependable and principled; people naturally lean on you',
      pro:'decisive, responsible and protective; a natural leader with strong ethics who keeps promises even when it costs you',
      con:'stubborn and proud; you take on too much yourself and rarely ask for help, which can harden into rigidity',
      adv:'learn to bend like the crown of a tree in the wind — delegate, listen, and let others grow beside you'},
    '乙':{name:'Yi — Yin Wood 乙木', sym:'the vine and the flower — gentle, flexible, tenacious', imp:'soft-spoken yet charming; you win people over quietly',
      pro:'diplomatic and resilient; you know how to borrow strength from others and survive every winter, then bloom again',
      con:'overly dependent on approval; under pressure you hesitate and let others make the call',
      adv:'grow your own roots — practice making one firm decision a day without asking anyone'},
    '丙':{name:'Bing — Yang Fire 丙火', sym:'the blazing sun — open, radiant, generous', imp:'warm, energetic and honest; you light up the room',
      pro:'enthusiastic and straightforward; you inspire people and never hide your intentions',
      con:'impatient and hot-tempered; you burn bright, decide fast and sometimes burn others — or yourself — out',
      adv:'the sun also sets: pace your energy, sleep on big decisions, and let your warmth be steady rather than blazing'},
    '丁':{name:'Ding — Yin Fire 丁火', sym:'灯火、安静、缜密 — the candlelight: quiet, refined, meticulous', imp:'compassionate and full of quiet wisdom; people feel understood around you',
      pro:'considerate and detail-minded, with a sacrificial spirit and strong moral compass; you notice what others miss',
      con:'your thinking runs so fine it turns suspicious — to outsiders this can read as scheming or excessive doubt',
      adv:'open the door a little wider: trust the people around you, share what you really think, and the rewards will surprise you'},
    '戊':{name:'Wu — Yang Earth 戊土', sym:'the great mountain — solid, still, immovable', imp:'steady and trustworthy; you are the anchor of your circle',
      pro:'tolerant and faithful; you accumulate — wealth, skills, people — patiently and keep your word',
      con:'slow to change; once you form a view it is easier to move a mountain than your mind',
      adv:'even mountains erode into fertile valleys — try one new method each month before dismissing it'},
    '己':{name:'Ji — Yin Earth 己土', sym:'the garden soil — nurturing, humble, productive', imp:'caring and modest; people feel safe confiding in you',
      pro:'supportive and practical; you grow talent around you and manage details no one else wants to touch',
      con:'worry-prone and self-effacing; you absorb others\' problems until your own needs vanish',
      adv:'a field must rest to stay fertile — set boundaries, charge what you are worth, and say no once a week'},
    '庚':{name:'Geng — Yang Metal 庚金', sym:'the raw ore and the sword — hard, decisive, righteous', imp:'strong-willed and direct; you get things done',
      pro:'loyal and brave; you cut through confusion, execute fast and defend your people',
      con:'your words can cut like the blade you embody — blunt honesty sometimes wounds the innocent',
      adv:'ore must be tempered into a sword with restraint — soften your delivery, keep the steel inside'},
    '辛':{name:'Xin — Yin Metal 辛金', sym:'the polished jewel — refined, sharp, exacting', imp:'delicate and proud; you carry an air of precision',
      pro:'meticulous with high standards; your sense of quality and aesthetics produces excellent work',
      con:'prone to vanity and criticism; small slights stay in your memory far too long',
      adv:'a jewel does not argue with glass — let go of petty grievances and reserve your brilliance for what matters'},
    '壬':{name:'Ren — Yang Water 壬水', sym:'the great ocean — vast, resourceful, restless', imp:'clever and sociable; you adapt to anyone, anywhere',
      pro:'strategic and generous; you see three moves ahead and share what you have',
      con:'restless and scattered; your currents run in five directions at once, and indulgence can erode discipline',
      adv:'rivers reach the sea by choosing one bed — focus on a single main channel for a year and watch the results'},
    '癸':{name:'Gui — Yin Water 癸水', sym:'the rain and dew — intuitive, gentle, penetrating', imp:'quietly mysterious and kind; you sense moods before words are spoken',
      pro:'imaginative and perceptive; your persistence is the soft rain that wears through stone',
      con:'anxious and moody; when cornered you tend to retreat into fog rather than face things head-on',
      adv:'dew shines brightest when it faces the sun — name the problem out loud today, not tomorrow'}
  };

  var CAREER = {
    '木':'education, publishing, medicine & healthcare, design, textiles, forestry & green industries',
    '火':'energy & power, media & entertainment, restaurants & F&B, beauty, lighting, e-commerce livestreams',
    '土':'real estate & construction, agriculture, insurance, ceramics, warehousing, HR & administration',
    '金':'banking & finance, machinery & hardware, IT & electronics, automotive, law & enforcement, precision trades',
    '水':'logistics & trade, travel, import-export, beverages, aquatics, communications & streaming media'
  };
  var REMEDY = {
    '木':'Wear greens, keep living plants, place your desk facing east; a morning reading habit feeds Wood.',
    '火':'Use warm colors and real sunlight, keep an active social life; south-facing spaces strengthen Fire.',
    '土':'Add ceramics and yellows, garden or cook with your hands; steady daily routines build Earth.',
    '金':'White and gold accents, quality metal accessories; structured schedules and written discipline feed Metal.',
    '水':'Blacks and blues, time near rivers or the sea; keep one flexible, flowing project in your life.'
  };

  /* ---------- core computation ---------- */
  function computeChart(solar, lunar, ec, gender, name, nowYear){
    var pillars = [
      { key:'Year',  zh:'年柱', gan:ec.getYear(),  zhi:'', ts:ec.getYearShiShenGan(),  hide:ec.getYearHideGan(),  tsZhi:ec.getYearShiShenZhi() },
      { key:'Month', zh:'月柱', gan:ec.getMonth(), zhi:null, ts:ec.getMonthShiShenGan(), hide:ec.getMonthHideGan(), tsZhi:ec.getMonthShiShenZhi() },
      { key:'Day',   zh:'日柱', gan:ec.getDay(),   zhi:null, ts:'日主', hide:ec.getDayHideGan(),   tsZhi:ec.getDayShiShenZhi() },
      { key:'Hour',  zh:'时柱', gan:ec.getTime(),  zhi:null, ts:ec.getTimeShiShenGan(), hide:ec.getTimeHideGan(),  tsZhi:ec.getTimeShiShenZhi() }
    ];
    // branch char = 2nd char of pillar ganzhi
    pillars.forEach(function(p){ p.zhi = p.gan.charAt(1); });

    var dayGan = ec.getDay().charAt(0);
    var dayWx = GAN_WX[GAN.indexOf(dayGan)];

    /* five element scores */
    var score = {'金':0,'木':0,'水':0,'火':0,'土':0};
    var count = {'金':0,'木':0,'水':0,'火':0,'土':0};
    pillars.forEach(function(p){
      score[GAN_WX[GAN.indexOf(p.gan.charAt(0))]] += WX_SCORE_W[0];
      count[GAN_WX[GAN.indexOf(p.gan.charAt(0))]] += 1;
      p.hide.forEach(function(h, i){
        score[GAN_WX[GAN.indexOf(h)]] += WX_SCORE_W[i+1] || 2;
      });
      count[ZHI_WX[ZHI.indexOf(p.zhi)]] += 1;
    });

    var mother = Object.keys(SHENG).filter(function(k){ return SHENG[k] === dayWx; })[0]; // 生我
    var child  = SHENG[dayWx];   // 我生
    var wealth = KE[dayWx];      // 我克
    var officer= Object.keys(KE).filter(function(k){ return KE[k] === dayWx; })[0]; // 克我

    var same = score[dayWx] + score[mother];
    var other = score[child] + score[wealth] + score[officer];
    var diff = same - other;
    var weak = diff < 0;
    var strengthProb = Math.round(50 + Math.abs(diff) / (same + other) * 50);
    var strength = Math.abs(diff)/(same+other) < 0.08 ? 'Balanced (中和)' : (weak ? 'Weak chart (偏弱)' : 'Strong chart (偏旺)');

    var favorable = weak ? [dayWx, mother] : [child, wealth];
    var unfavorable = weak ? [wealth, officer] : [dayWx, mother];

    var season = seasonOf(pillars[1].zhi);
    var states = STATE[season];

    var strongest = WX_KEY.reduce(function(a,b){ return score[b] > score[a] ? b : a; }, '金');

    /* tags: what each element means for THIS day master */
    var tags = {};
    tags[dayWx]  = 'Self & willpower';
    tags[child]  = 'Output & talent';
    tags[wealth] = 'Money & assets';
    tags[officer]= 'Career & pressure';
    tags[mother] = 'Support & learning';

    /* missing elements */
    var missing = WX_KEY.filter(function(w){ return count[w] === 0; });

    /* luck cycles */
    var yun = ec.getYun(gender === 'male' ? 1 : 0);
    var daYun = yun.getDaYun().map(function(d){
      var gz = d.getGanZhi();
      return { startYear:d.getStartYear(), startAge:d.getStartAge(), gz:gz || null,
               tenGod: gz ? tenGodEn(dayGan, gz.charAt(0)) : null };
    });
    var yunInfo = null;
    try {
      yunInfo = { y:yun.getStartYear(), m:yun.getStartMonth(), d:yun.getStartDay() };
    } catch(e){}

    /* recent 12 years */
    var birthYear = solar.getYear();
    var years = [];
    for (var y = birthYear; y < birthYear + 12; y++){
      var gz = yearGZ(y);
      years.push({ year:y, age: y - birthYear + 1, gz:gz,
        stem:gz.charAt(0), branch:gz.charAt(1),
        animal:ZHI_ANI[ZHI.indexOf(gz.charAt(1))],
        now: (nowYear || new Date().getFullYear()) === y });
    }

    var yinList = pillars.map(function(p){
      return (GAN_YANG[GAN.indexOf(p.gan.charAt(0))] ? 'Yang' : 'Yin');
    });

    var patternTenGod = pillars[1].tsZhi[0]; // month branch main-qi ten god
    var patternEn = SHI_EN[patternTenGod] || patternTenGod;

    var persona = PERSONA[dayGan];

    return {
      name: name || 'Friend',
      gender: gender, genderEn: gender === 'male' ? 'handsome guy' : 'beautiful lady',
      dateEn: solar.toYmd() + ' at ' + solar.getHour() + ':' + (solar.getMinute()<10?'0':'') + solar.getMinute(),
      pillars: pillars,
      dayGan: dayGan, dayWx: dayWx, mother: mother, child: child, wealth: wealth, officer: officer,
      score: score, count: count, same: same, other: other, diff: diff,
      weak: weak, strength: strength, strengthProb: strengthProb,
      favorable: favorable, unfavorable: unfavorable,
      season: season, seasonEn: SEASON_EN[season], states: states, strongest: strongest,
      tags: tags, missing: missing,
      daYun: daYun, yunInfo: yunInfo,
      years: years, yinList: yinList,
      patternTenGod: patternTenGod, patternEn: patternEn,
      animal: lunar.getYearShengXiao(), animalEn: ZHI_ANI[ZHI.indexOf(lunar.getYearZhi())],
      yearGZ: lunar.getYearInGanZhiByLiChun(),
      xiu: lunar.getXiu(), xiuWx: XIU_WX[lunar.getXiu()] || '土',
      persona: persona,
      monthGanZhi: ec.getMonth()
    };
  }

  /* ---------- renderer ---------- */
  function renderReport(r){
    var h = '';
    /* intro */
    h += '<div class="rp-intro"><p><strong>' + esc(r.name) + '</strong> was born on <span class="hl">' + r.dateEn +
      '</span>. The year pillar is <span class="hl">' + r.yearGZ + ' — a ' + (GAN_YANG[GAN.indexOf(r.yearGZ.charAt(0))]?'Yang':'Yin') +
      ' ' + WX_EN[GAN_WX[GAN.indexOf(r.yearGZ.charAt(0))]] + ' ' + ZHI_ANI[ZHI.indexOf(r.yearGZ.charAt(1))] + ' year</span>. ' +
      'The Day Master (本命元神) is <span class="hl">' + r.dayGan + ' — ' + (GAN_YANG[GAN.indexOf(r.dayGan)]?'Yang':'Yin') + ' ' + WX_EN[r.dayWx] +
      '</span>, born in the ' + r.monthGanZhi + ' month — a <strong>' + r.patternEn + ' (' + r.patternTenGod + '格)</strong>. ' +
      'A ' + r.yinList.join('-') + ' birth (' + r.yinList.join(' year, ') + ' hour) — what the classics call a ' + r.genderEn + '\'s chart. ' +
      'The full chart, life luck cycles and twelve-year forecast are laid out below — a professional-grade BaZi reading rarely seen on the open web. Read it carefully!</p></div>';

    /* four pillars table */
    h += '<h3 class="rp-h">The Four Pillars <span class="cn-sub">八字命盘</span></h3>';
    h += '<div class="rp-chart">';
    h += '<table class="bzt"><thead><tr><th></th><th>Year Pillar</th><th>Month Pillar</th><th>Day Pillar</th><th>Hour Pillar</th></tr></thead><tbody>';
    h += '<tr><th>Ten God</th>' + r.pillars.map(function(p){ return '<td>' + (SHI_EN[p.ts]||p.ts) + '</td>'; }).join('') + '</tr>';
    h += '<tr><th>Heavenly Stem</th>' + r.pillars.map(function(p){ return '<td class="big">' + p.gan.charAt(0) + '<span class="wx-tag">' + WX_EN[GAN_WX[GAN.indexOf(p.gan.charAt(0))]] + '</span></td>'; }).join('') + '</tr>';
    h += '<tr><th>Earthly Branch</th>' + r.pillars.map(function(p){ return '<td class="big">' + p.zhi + '<span class="wx-tag">' + WX_EN[ZHI_WX[ZHI.indexOf(p.zhi)]] + '</span></td>'; }).join('') + '</tr>';
    h += '<tr><th>Hidden Stems</th>' + r.pillars.map(function(p){
      return '<td>' + p.hide.map(function(hd,i){ return '<span class="hide-gan">' + hd + ' <em>' + (SHI_EN[p.tsZhi[i]]||'') + '</em></span>'; }).join('<br/>') + '</td>';
    }).join('') + '</tr>';
    h += '</tbody></table>';
    h += '<div class="rp-side">';
    h += '<div class="side-item"><div class="si-k">Pattern 格局</div><div class="si-v">' + r.patternEn + '</div></div>';
    h += '<div class="side-item"><div class="si-k">Chart Strength</div><div class="si-v">' + r.strength + '<br/><small>probability ≈ ' + r.strengthProb + '%</small></div></div>';
    h += '<div class="side-item"><div class="si-k">Favorable 喜用</div><div class="si-v">' + r.favorable.map(function(w){return WX_EN[w];}).join(' · ') + '</div></div>';
    h += '<div class="side-item"><div class="si-k">Star Mansion 星宿</div><div class="si-v">' + r.xiu + ' (' + WX_EN[r.xiuWx] + ')</div></div>';
    h += '<div class="side-item"><div class="si-k">Element State</div>' + WX_KEY.map(function(w){ return '<div class="si-mini">' + WX_EN[w] + ': ' + STATE_EN[r.states[w]] + '</div>'; }).join('') + '</div>';
    h += '<div class="side-item"><div class="si-k">This Year 流年</div><div class="si-v">' + yearGZ(new Date().getFullYear()) + '<br/><small>' + new Date().getFullYear() + ' ' + ZHI_ANI[ZHI.indexOf(yearGZ(new Date().getFullYear()).charAt(1))] + '</small></div></div>';
    h += '</div></div>';

    if (r.yunInfo){
      h += '<div class="rp-note">Luck cycles switch on <strong>' + r.yunInfo.y + ' years ' + r.yunInfo.m + ' months ' + r.yunInfo.d + ' days</strong> after birth — every ' + r.daYun[1].startAge + '-year cycle that follows rewrites the theme of the decade.</div>';
    }

    /* luck cycles */
    h += '<h3 class="rp-h">Life Luck Cycles <span class="cn-sub">大运</span></h3>';
    h += '<div style="overflow-x:auto"><table class="bzt small"><thead><tr><th>#</th><th>Starts</th><th>Age</th><th>GanZhi</th><th>Stem Ten God</th><th>Theme</th></tr></thead><tbody>';
    r.daYun.forEach(function(d, i){
      var gz = d.gz || '—';
      var branchAnimal = d.gz ? ZHI_ANI[ZHI.indexOf(d.gz.charAt(1))] : '';
      h += '<tr><td>' + (i+1) + '</td><td>' + d.startYear + '</td><td>' + d.startAge + '</td><td class="big2">' + gz + '</td><td>' + (d.tenGod || 'Before cycles begin') + '</td><td>' + (branchAnimal ? branchAnimal + ' phase' : 'childhood') + '</td></tr>';
    });
    h += '</tbody></table></div>';

    /* recent years */
    h += '<h3 class="rp-h">Twelve-Year Forecast <span class="cn-sub">近期流年排列</span></h3>';
    h += '<div style="overflow-x:auto"><table class="bzt years"><thead><tr><th>Year</th>';
    r.years.forEach(function(y){ h += '<th' + (y.now?' class="now"':'') + '>' + y.year + '</th>'; });
    h += '</tr></thead><tbody>';
    h += '<tr><th>Age</th>' + r.years.map(function(y){ return '<td' + (y.now?' class="now"':'') + '>' + y.age + '</td>'; }).join('') + '</tr>';
    h += '<tr><th>Stem</th>' + r.years.map(function(y){ return '<td' + (y.now?' class="now"':'') + '>' + y.stem + '</td>'; }).join('') + '</tr>';
    h += '<tr><th>Branch</th>' + r.years.map(function(y){ return '<td' + (y.now?' class="now"':'') + '>' + y.branch + '</td>'; }).join('') + '</tr>';
    h += '<tr><th>Sign</th>' + r.years.map(function(y){ return '<td' + (y.now?' class="now"':'') + '>' + y.animal + '</td>'; }).join('') + '</tr>';
    h += '</tbody></table></div>';

    /* five elements */
    h += '<h3 class="rp-h">Five Elements Analysis <span class="cn-sub">五行分析</span></h3>';
    h += '<div class="wx-cards">';
    WX_KEY.forEach(function(w){
      h += '<div class="wx-card"><div class="wxe">' + WX_EMOJI[w] + '</div><div class="wxn">' + WX_EN[w] + '</div><div class="wxt">' + r.tags[w] + '</div><div class="wxs">' + r.score[w].toFixed(1) + '</div></div>';
    });
    h += '</div>';
    h += '<p><strong>Element count:</strong> ' + WX_KEY.map(function(w){ return r.count[w] + ' ' + WX_EN[w]; }).join(', ') + '.</p>';
    h += '<p><strong>Scores:</strong> Self-side (Day Master ' + WX_EN[r.dayWx] + ' + Support ' + WX_EN[r.mother] + ') = <strong>' + r.same.toFixed(1) +
      '</strong>; Opposing side (' + WX_EN[r.child] + ' + ' + WX_EN[r.wealth] + ' + ' + WX_EN[r.officer] + ') = <strong>' + r.other.toFixed(1) +
      '</strong>. Difference: <strong>' + (r.diff>0?'+':'') + r.diff.toFixed(1) + '</strong>.</p>';
    h += '<div class="rp-verdict">This chart is dominated by <strong>' + WX_EN[r.strongest] + '</strong> (' + r.score[r.strongest].toFixed(1) +
      ' points). The Day Master <strong>' + r.dayGan + ' (' + WX_EN[r.dayWx] + ')</strong>, born in ' + r.seasonEn +
      ', is <strong>' + (r.weak ? 'under-supported' : 'well-supported but overflowing') + '</strong> — ' +
      (r.weak ? 'it needs ' + WX_EN[r.mother] + ' (nourishment) and ' + WX_EN[r.dayWx] + ' (reinforcement).'
              : 'it needs ' + WX_EN[r.child] + ' (expression) and ' + WX_EN[r.wealth] + ' (purpose) to drain the excess into achievement.') + '</div>';

    if (r.missing.length){
      h += '<div class="rp-missing"><strong>Missing in this chart:</strong> ' + r.missing.map(function(w){ return WX_EN[w]; }).join(', ') +
        '.<ul>' + r.missing.map(function(w){ return '<li><strong>' + WX_EN[w] + ':</strong> ' + REMEDY[w] + '</li>'; }).join('') + '</ul></div>';
    } else {
      h += '<div class="rp-missing good">Good news: <strong>nothing is missing</strong> — all five elements are present in this chart, a balanced foundation most people do not have.</div>';
    }

    /* favorable */
    h += '<h3 class="rp-h">Favorable Elements <span class="cn-sub">喜用神</span></h3>';
    h += '<div class="rp-verdict jade-line">After weighing the five elements against the season of birth, this chart takes <strong class="hl2">' +
      r.favorable.map(function(w){ return WX_EN[w]; }).join(' & ') + '</strong> as its favorable elements' +
      (r.unfavorable.length ? ' and should go easy on <strong>' + r.unfavorable.map(function(w){ return WX_EN[w]; }).join(' & ') + '</strong>' : '') +
      '. Align your color, direction, industry and timing with them — this is the single highest-leverage correction in Chinese metaphysics.</div>';

    /* careers */
    h += '<h3 class="rp-h">Career Alignment <span class="cn-sub">行业选择</span></h3>';
    h += '<p>Industries that resonate with your favorable elements <strong>' + r.favorable.map(function(w){ return WX_EN[w]; }).join(' & ') + '</strong>:</p><ul>' +
      r.favorable.map(function(w){ return '<li><strong>' + WX_EN[w] + ':</strong> ' + CAREER[w] + '</li>'; }).join('') + '</ul>';

    /* personality */
    h += '<h3 class="rp-h">Day Master Personality <span class="cn-sub">五行命盘</span></h3>';
    h += '<div class="rp-persona"><p>Your Day Master is <strong class="hl">' + r.persona.name + '</strong> — ' + r.persona.sym + '.</p>' +
      '<p><strong>The impression you give:</strong> ' + r.persona.imp + '.</p>' +
      '<p><strong>Your strengths:</strong> ' + r.persona.pro + '.</p>' +
      '<p><strong>Your weaknesses:</strong> ' + r.persona.con + '.</p>' +
      '<p><strong>Advice for you:</strong> ' + r.persona.adv + '.</p></div>';

    /* upsell */
    h += '<div class="rp-upsell"><h3>What the free chart does NOT tell you</h3>' +
      '<p>The universal analysis above applies to everyone with the same Day Master. Your <strong>AI Full Report ($19.9)</strong> goes further: your own personality deep-dive, wealth timing, marriage & relationship analysis, career strategy, and a year-by-year playbook for the next decade — written in plain English from YOUR exact chart.</p>' +
      '<button class="btn btn-primary" id="aiBtn">Get My Full AI Report — $19.9</button></div>';
    return h;
  }

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  root.SageFate = { computeChart: computeChart, renderReport: renderReport };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.SageFate;
})(typeof window !== 'undefined' ? window : globalThis);
