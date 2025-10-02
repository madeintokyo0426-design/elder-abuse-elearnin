'use client'
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, RefreshCcw } from "lucide-react";

// ---------------------------------------------
// 高齢者虐待防止・権利擁護 e-learning（社内向け）
// 要件:
// ・全20問から毎回ランダムで15問を出題
// ・回答後「採点する」で結果表示
// ・満点(15/15)以外は終了させず再挑戦ボタンのみ表示
// ・再挑戦時は再びランダム抽出（毎回異なる並び/組合せ）
// ・上品で高級感のある見栄え（Tailwind + subtle gold accents）
// ---------------------------------------------

// 質問データ（answer は 0-based index）
const allQuestions = [
  {
    id: 1,
    text: "高齢者虐待防止法で定義されている5つの虐待の種類として、正しい組み合わせはどれですか。",
    choices: [
      "身体的虐待、精神的虐待、社会的虐待、介護放棄、自己放任",
      "暴力的虐待、心理的虐待、性的虐待、経済的虐待、世話の放棄",
      "身体的虐待、介護・世話の放棄・放任（ネグレクト）、心理的虐待、性的虐待、経済的虐待",
      "身体的虐待、精神的虐待、経済的虐待、社会的虐待、セルフ・ネグレクト",
    ],
    answer: 2,
    explanation:
      "高齢者虐待防止法第2条では、虐待を『身体的虐待』『介護・世話の放棄・放任（ネグレクト）』『心理的虐待』『性的虐待』『経済的虐待』の5種類に分類しています。セルフ・ネグレクトは法律上の虐待の定義には含まれません。",
  },
  {
    id: 2,
    text: "生命または身体に重大な危険が生じている虐待を発見した場合、法律で定められた義務は何ですか。",
    choices: [
      "警察に直ちに通報する義務",
      "速やかに市町村に通報する義務",
      "家族や親族に連絡し、対応を協議する努力義務",
      "まずはケアプランに反映させ、様子を見る義務",
    ],
    answer: 1,
    explanation:
      "高齢者虐待防止法第7条により、生命又は身体に重大な危険が生じている虐待が疑われる場合は、速やかに市町村に通報しなければなりません。",
  },
  {
    id: 3,
    text:
      "利用者の息子が、本人の年金や預貯金を本人の意思に反して自分の生活費や借金返済に使っていることが判明しました。これはどの種類の虐待にあたりますか。",
    choices: ["心理的虐待", "介護・世話の放棄・放任（ネグレクト）", "経済的虐待", "身体的虐待"],
    answer: 2,
    explanation:
      "本人の合意なしに財産や金銭を使用する行為は経済的虐待の典型です。",
  },
  {
    id: 4,
    text:
      "訪問介護サービスにおいて、利用者の権利擁護の観点から不適切と考えられる行為はどれですか。",
    choices: [
      "掃除中にふさぎ込みに気づき事業所に報告・客観事実を記録",
      "年金の使い込み相談を受け上司へ報告し包括へ連絡",
      "調理時に本人の意向を聞き取りメニューを一緒に考える",
      "親しみを込めて本人名ではなく『おばあちゃん』と呼ぶ習慣",
    ],
    answer: 3,
    explanation:
      "『おじいちゃん』『おばあちゃん』と呼ぶ行為は尊厳を傷つける不適切な呼称となり得ます。心理的虐待と判断される可能性もあります。",
  },
  {
    id: 5,
    text: "権利擁護の基本的な考え方として、本人の意思を尊重し、本人が自ら決定できるよう支援することを何と呼びますか。",
    choices: ["代行決定の支援", "自己決定の支援", "パターナリズムに基づく保護", "事業者主導の計画"],
    answer: 1,
    explanation: "権利擁護の基本理念は本人の意思尊重であり、『自己決定の支援』が求められます。",
  },
  {
    id: 6,
    text: "高齢者虐待の通報・相談の第一義的な窓口となる機関はどこですか。",
    choices: ["警察署", "保健所", "市町村または地域包括支援センター", "社会福祉協議会"],
    answer: 2,
    explanation:
      "高齢者虐待防止法により通報・相談窓口は市町村と定められています（地域包括支援センターが担う地域もあります）。",
  },
  {
    id: 7,
    text: "高齢者虐待の発生要因として、調査で最も多く挙げられているものはどれですか。",
    choices: ["介護サービスの不適合", "経済的困窮", "虐待をしている人の性格や人格", "介護に関する知識・情報の不足"],
    answer: 2,
    explanation:
      "東京都調査では『虐待をしている人の性格や人格』が最多、次いで『これまでの人間関係』が挙げられました。",
  },
  {
    id: 8,
    text: "虐待の通報をした場合、通報者のプライバシーはどうなりますか。",
    choices: [
      "事実確認のため虐待者に通報者名が伝えられる",
      "通報者情報は守秘義務により漏らしてはならない",
      "警察捜査が必要な場合は通報者名が公開される",
      "匿名での通報は受け付けられない",
    ],
    answer: 1,
    explanation:
      "高齢者虐待防止法第8条・第23条により、通報者を特定させる情報を漏らしてはならない守秘義務が課されています。",
  },
  {
    id: 9,
    text: "認知症などにより判断能力が不十分な方の財産管理や契約行為を法的に支援する制度は何ですか。",
    choices: ["日常生活自立支援事業", "成年後見制度", "介護保険制度", "民生委員制度"],
    answer: 1,
    explanation:
      "成年後見制度は後見人等が法的権限に基づき財産管理・契約手続きを行う仕組みで、経済的虐待防止にも有効です。",
  },
  {
    id: 10,
    text: "高齢者虐待防止法が目指していることとして、最も適切なものはどれですか。",
    choices: [
      "虐待者を厳しく罰すること",
      "虐待されている高齢者を施設に緊急入所させること",
      "高齢者の権利利益の擁護と、養護者（介護者）への支援",
      "家族内の問題に行政が介入する根拠を明確にすること",
    ],
    answer: 2,
    explanation:
      "目的は高齢者の権利利益の擁護とあわせて養護者支援を行い、双方を支えることです。",
  },
  {
    id: 11,
    text: "高齢者自身が自分の世話をしない、医療を拒否するなど、自身の心身を危険にさらす状態を何と呼びますか。",
    choices: [
      "心理的虐待",
      "介護・世話の放棄・放任（ネグレクト）",
      "セルフ・ネグレクト（自己放任）",
      "社会的孤立",
    ],
    answer: 2,
    explanation:
      "セルフ・ネグレクトは他者からの行為ではなく、法律上の『虐待』には含まれませんが支援が必要です。",
  },
  {
    id: 12,
    text: "高齢者虐待の背景にある複雑な要因を解決するために、最も重要とされるアプローチは何ですか。",
    choices: ["担当者一人が責任を持って対応", "警察にすべて委ねる", "多職種・多機関連携のチームアプローチ", "家族間の話し合いに任せる"],
    answer: 2,
    explanation:
      "介護・医療・経済・家族関係などが絡むため、多機関連携によるチームアプローチが基本です。",
  },
  {
    id: 13,
    text: "『日常生活自立支援事業（地域福祉権利擁護事業）』で提供される支援の内容として、適切なものはどれですか。",
    choices: [
      "身体介護や家事援助などの訪問介護",
      "福祉サービス利用手続き援助や日常的な金銭管理",
      "成年後見人として法的な財産管理や契約行為を代行",
      "緊急時に駆けつける通報サービス",
    ],
    answer: 1,
    explanation:
      "同事業は福祉サービスの利用援助や公共料金支払いなど日常的金銭管理、重要書類の預かり等を行います。",
  },
  {
    id: 14,
    text:
      "利用者宅を訪問した際、怒鳴り声が聞こえ高齢者に新しいあざがあるのを発見。介護サービス事業者として、まず行うべき行動はどれですか。",
    choices: [
      "家族に内密に本人から詳しく話を聞く",
      "その場で家族を指導してやめさせる",
      "上司に報告し、組織として対応を検討する",
      "証拠がないためしばらく様子を見る",
    ],
    answer: 2,
    explanation:
      "一職員の単独判断はリスク。まず上司へ報告し、組織として事実整理・対応検討の上で通報・相談へ。",
  },
  {
    id: 15,
    text:
      "利用者本人の意思を最大限に尊重し、その人が持つ力を引き出し自ら生活をコントロールできるように支援する考え方は何と呼びますか。",
    choices: ["アセスメント", "モニタリング", "エンパワメント", "コンプライアンス"],
    answer: 2,
    explanation: "エンパワメントは自己決定を支援し、生活の主体性を高める考え方です。",
  },
  {
    id: 16,
    text: "千代田区の高齢者虐待防止の取り組みとして、区民向けハンドブックの愛称は何ですか。",
    choices: ["あんしん手帳", "かがやきノート", "ノックの手帳", "ささえあいブック"],
    answer: 2,
    explanation:
      "千代田区は『高齢者虐待ゼロのまちづくりハンドブック ノックの手帳』を作成・配布しています。",
  },
  {
    id: 17,
    text: "高齢者虐待の通報を受けた市町村が、虐待の事実確認のために行うことができる法的権限は何ですか。",
    choices: ["家宅捜索", "立入調査", "逮捕・勾留", "財産の差し押さえ"],
    answer: 1,
    explanation:
      "高齢者虐待防止法第11条により、市町村長は必要に応じて住居への立入調査を行うことができます。",
  },
  {
    id: 18,
    text: "虐待の背景要因として『介護疲れ・介護ストレス』がある場合、特に有効な支援策はどれですか。",
    choices: ["成年後見制度の利用", "ショートステイやデイサービスの利用促進", "現金給付による経済支援", "介護者への厳しい指導"],
    answer: 1,
    explanation:
      "介護者のレスパイト確保が重要。ショートステイやデイサービスの活用が有効です。",
  },
  {
    id: 19,
    text:
      "介護サービス事業者に対して、令和6年4月から高齢者虐待防止のために義務化された措置に含まれないものはどれですか。",
    choices: [
      "虐待防止対策を検討する委員会の定期開催",
      "虐待防止のための指針の整備",
      "全職員への監視カメラの設置",
      "虐待防止のための研修の定期実施",
    ],
    answer: 2,
    explanation:
      "令和6年4月から委員会設置・指針整備・研修実施・担当者設置が義務化。監視カメラ設置は義務ではありません。",
  },
  {
    id: 20,
    text: "高齢者虐待対応の基本姿勢として誤っているものはどれですか。",
    choices: [
      "高齢者本人の権利擁護を最優先する",
      "虐待者を罰することを第一の目的とする",
      "チームアプローチで対応する",
      "長期的視点で支援を行う",
    ],
    answer: 1,
    explanation:
      "目的は高齢者の安全確保と権利擁護、背景課題の解決と養護者支援であり、罰すること自体が第一目的ではありません。",
  },
];

function drawQuestions(list, count, seed) {
  const arr = [...list];
  let random = Math.sin(seed || Date.now()) * 10000;
  const seededRandom = () => {
    random = Math.sin(random + 1) * 10000;
    return random - Math.floor(random);
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

const STORAGE_KEY = "ea_quiz_results_v1";
function loadResults(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch(e){ console.warn("Failed to load results", e); return []; }
}
function saveResults(list){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
  catch(e){ console.warn("Failed to save results", e); }
}
function toCSV(results){
  const header = ["timestamp","department","fullName","attempt","score","total","questionId","questionText","selectedIndex","selectedText","correctIndex","correctText","isCorrect"];
  const lines = [header.join(",")];
  results.forEach(r=>{
    r.details.forEach(d=>{
      const row = [
        r.timestamp,
        r.dept,
        r.fullName,
        r.attempt,
        r.score,
        r.total,
        d.questionId,
        String(d.questionText||"").replaceAll("\n"," ").replaceAll(",","、"),
        d.selectedIndex,
        String(d.selectedText||"").replaceAll(",","、"),
        d.correctIndex,
        String(d.correctText||"").replaceAll(",","、"),
        d.isCorrect?"TRUE":"FALSE",
      ];
      lines.push(row.map(v=> typeof v === 'string' ? `"${v.replaceAll('"','""')}"` : v).join(","));
    });
  });
  return lines.join("\n");
}

function download(filename, text){
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}

const WEBHOOK_KEY = "ea_webhook_url";
const PENDING_KEY = "ea_pending_posts_v1";

function isPreviewSandbox(){
  try {
    const h = location.hostname || "";
    if (h.includes("chatgpt") || h.includes("openai")) return true;
  } catch(_){}
  try {
    const ref = document.referrer ? new URL(document.referrer).hostname : "";
    if (ref.includes("chatgpt") || ref.includes("openai")) return true;
  } catch(_){}
  return false;
}
function loadPending(){ try{ const r = localStorage.getItem(PENDING_KEY); return r? JSON.parse(r): []; } catch{ return []; } }
function savePending(arr){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(arr)); } catch{} }
function queuePending(url, data){ const q = loadPending(); q.push({ url, data, ts: Date.now() }); savePending(q); }
async function flushPending(){
  if (isPreviewSandbox()) return;
  const q = loadPending();
  if (!q.length) return;
  const remain = [];
  for (const item of q){
    let ok = false;
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([item.data], { type: 'text/plain;charset=UTF-8' });
        ok = navigator.sendBeacon(item.url, blob);
      }
    } catch(_){}
    if (!ok) {
      try { await fetch(item.url, { method:'POST', mode:'no-cors', keepalive:true, body:item.data }); ok = True; } catch(_){ ok = false; }
    }
    if (!ok) remain.push(item);
  }
  savePending(remain);
}
function postWebhook(url, payload){
  if (!url) return;
  const data = JSON.stringify(payload);
  if (isPreviewSandbox()) { queuePending(url, data); return; }
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([data], { type: 'text/plain;charset=UTF-8' });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    }
  } catch(_){}
  try { fetch(url, { method:'POST', mode:'no-cors', keepalive:true, body:data }); } catch(e){ console.warn('Webhook error', e); }
}

export default function ElderAbuseQuizApp() {
  const [attempt, setAttempt] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [dept, setDept] = useState("");
  const [fullName, setFullName] = useState("");
  const [results, setResults] = useState(loadResults());
  const [webhookUrl, setWebhookUrl] = useState(()=>{ try { return localStorage.getItem(WEBHOOK_KEY) || ""; } catch { return ""; } });
  const [saveStatus, setSaveStatus] = useState("idle");
  const [passcode, setPasscode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [delAsk, setDelAsk] = useState(false);
  const [delCode, setDelCode] = useState("");
  const [delStatus, setDelStatus] = useState("idle");

  const saveWebhook = () => {
    try { localStorage.setItem(WEBHOOK_KEY, webhookUrl); setSaveStatus("ok"); }
    catch(e){ try { sessionStorage.setItem(WEBHOOK_KEY, webhookUrl); setSaveStatus("session"); } catch { setSaveStatus("error"); } }
  };
  const tryUnlock = () => { if (passcode === "2255") { setUnlocked(true); setSaveStatus("idle"); } else { setSaveStatus("wrong"); } };

  const quizQuestions = useMemo(() => drawQuestions(allQuestions, 15, Date.now() + attempt), [attempt]);

  const [answers, setAnswers] = useState(Array(quizQuestions.length).fill(null));

  useEffect(() => {
    setAnswers(Array(quizQuestions.length).fill(null));
    setSubmitted(false);
    setScore(0);
  }, [quizQuestions]);

  useEffect(() => {
    try {
      const sample = drawQuestions(allQuestions, 15, 12345);
      console.assert(sample.length === 15, "[TEST] 15問抽出ができていません");
      console.assert(new Set(sample.map((q) => q.id)).size === 15, "[TEST] 重複した設問が含まれています");
      allQuestions.forEach((q) => {
        console.assert(q.answer >= 0 && q.answer < q.choices.length, `[TEST] answer index out of range: id=${q.id}`);
      });
      const dummy = Array(15).fill(null);
      dummy[0] = 0;
      const answeredCount = dummy.filter((a) => a !== null).length;
      const expectedProgress = Math.round((answeredCount / 15) * 100);
      console.assert(expectedProgress === Math.round((1 / 15) * 100), "[TEST] 進捗計算に不整合があります");
    } catch (e) {
      console.warn("Self tests failed:", e);
    }
  }, []);

  useEffect(() => {
    flushPending();
    const onFocus = () => flushPending();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const allAnswered = answers.every((a) => a !== null);

  const handleSelect = (qIndex, choiceIndex) => {
    if (submitted) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = choiceIndex;
      return next;
    });
  };

  const handleSubmit = () => {
    if (!allAnswered || dept.trim() === "" || fullName.trim() === "") return;
    const s = answers.reduce((acc, ans, i) => (ans === quizQuestions[i].answer ? acc + 1 : acc), 0);
    setScore(s);
    setSubmitted(true);

    const detail = quizQuestions.map((q, i) => ({
      questionId: q.id,
      questionText: q.text,
      selectedIndex: answers[i],
      selectedText: q.choices[answers[i]],
      correctIndex: q.answer,
      correctText: q.choices[q.answer],
      isCorrect: answers[i] === q.answer,
    }));
    const record = {
      timestamp: new Date().toISOString(),
      dept: dept.trim(),
      fullName: fullName.trim(),
      attempt,
      score: s,
      total: quizQuestions.length,
      details: detail,
    };
    const next = [...results, record];
    setResults(next);
    saveResults(next);

    if (webhookUrl) {
      postWebhook(webhookUrl, record);
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = () => { window.print(); };

  const doDeleteAll = () => {
    if (delCode !== "2255") { setDelStatus("wrong"); return; }
    try { localStorage.removeItem(STORAGE_KEY); } catch(_){ }
    setResults([]);
    setDelStatus("ok");
    setDelAsk(false);
    setDelCode("");
  };

  const handleRetry = () => {
    setAttempt((a) => a + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const passed = submitted && score === quizQuestions.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const progress = Math.round((answeredCount / Math.max(quizQuestions.length, 1)) * 100);
  const canSubmit = allAnswered && dept.trim() !== "" && fullName.trim() !== "";

  const exportAll = () => {
    const csv = toCSV(results);
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
    download(`e-learning-results-${ts}.csv`, csv);
  };
  const passRate = results.length ? Math.round((results.filter(r=>r.score===r.total).length/results.length)*100) : 0;
  const avgAccuracy = (()=>{ const c=results.reduce((a,r)=>a+r.score,0); const t=results.reduce((a,r)=>a+r.total,0); return t? Math.round((c/t)*100):0; })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-zinc-100 text-zinc-800">
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-zinc-200">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner" />
            <div>
              <h1 className="text-xl font-semibold tracking-tight">高齢者虐待防止・権利擁護 e-learning</h1>
              <p className="text-xs text-zinc-500">社内研修｜全20問から毎回15問をランダム出題</p>
            </div>
          </div>
          <div className="hidden md:block w-56">
            <Progress value={progress} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Tabs defaultValue="quiz">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="quiz">テスト</TabsTrigger>
            <TabsTrigger value="summary">集計</TabsTrigger>
          </TabsList>

          <TabsContent value="quiz">
            <Card className="border-amber-200/60 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl font-serif tracking-wide">確認テスト</span>
                  {submitted && (
                    passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-sm border border-emerald-200"><CheckCircle2 className="h-4 w-4" /> 合格</span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-4 py-2 text-amber-800 text-base md:text-lg border-2 border-amber-300 shadow-sm"><XCircle className="h-5 w-5 md:h-6 md:w-6" /> 再挑戦が必要</span>
                    )
                  )}
                </CardTitle>
                <CardDescription className="text-zinc-600">
                  所属・氏名を入力の上、15問すべてに回答してから「採点する」を押してください。満点になるまで終了できません。再挑戦すると毎回ランダムで出題されます。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">所属<span className="ml-1 text-amber-600">*</span></label>
                    <Select value={dept} onValueChange={setDept}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="所属を選択" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="特別養護老人ホーム">特別養護老人ホーム</SelectItem>
                        <SelectItem value="看護">看護</SelectItem>
                        <SelectItem value="訪問介護">訪問介護</SelectItem>
                        <SelectItem value="居宅介護支援事業所">居宅介護支援事業所</SelectItem>
                        <SelectItem value="包括支援センター">包括支援センター</SelectItem>
                        <SelectItem value="事務">事務</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700">氏名<span className="ml-1 text-amber-600">*</span></label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="例：山田 太郎" required />
                  </div>
                </div>
                {submitted && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <p className="text-lg font-semibold">
                      結果：<span className="tabular-nums">{score}</span> / {quizQuestions.length}
                    </p>
                    <p className="text-sm mt-1 text-zinc-700">受講者：{dept} ／ {fullName}</p>
                    <p className="text-sm opacity-90">
                      {passed ? "満点です。大変すばらしいです！" : "満点ではありません。理解を深めるため再挑戦してください。"}
                    </p>
                  </div>
                )}

                <ol className="space-y-6">
                  {quizQuestions.map((q, qi) => {
                    const selected = answers[qi];
                    const correctIndex = q.answer;
                    return (
                      <li key={q.id}>
                        <Card className="border-zinc-200 shadow-sm">
                          <CardHeader>
                            <CardTitle className="text-base font-semibold">
                              第{qi + 1}問．{q.text}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-3">
                              {q.choices.map((choice, ci) => {
                                const chosen = selected === ci;
                                const showCorrect = submitted && ci === correctIndex;
                                const showWrongChosen = submitted && chosen && ci !== correctIndex;
                                return (
                                  <label
                                    key={ci}
                                    className={[
                                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                                      chosen && !submitted && "border-amber-400 ring-1 ring-amber-300 bg-amber-50",
                                      showCorrect && "border-emerald-300 ring-1 ring-emerald-200 bg-emerald-50",
                                      showWrongChosen && "border-rose-300 ring-1 ring-rose-200 bg-rose-50",
                                      !chosen && !submitted && "hover:bg-zinc-50",
                                    ]
                                      .filter(Boolean)
                                      .join(" ")}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${qi}`}
                                      className="mt-1 h-4 w-4"
                                      checked={chosen || false}
                                      onChange={() => handleSelect(qi, ci)}
                                      disabled={submitted}
                                      aria-label={`選択肢${ci + 1}`}
                                    />
                                    <div className="leading-relaxed">
                                      <div className="font-medium">
                                        {ci + 1}. {choice}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            {submitted && (
                              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                <div className="font-semibold mb-1">解説</div>
                                <p>{q.explanation}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </li>
                    );
                  })}
                </ol>
              </CardContent>
              <CardFooter className="flex items-center justify-between gap-3">
                <div className="flex-1 md:max-w-[280px]">
                  <Progress value={progress} />
                  <p className="mt-2 text-xs text-zinc-500">回答進捗：{progress}%（{answers.filter((a) => a !== null).length}/{quizQuestions.length}）</p>
                </div>

                {submitted && (
                  <Button variant="outline" onClick={handlePrint} className="rounded-2xl px-6 shadow-sm">印刷する</Button>
                )}

                {!submitted && (
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="rounded-2xl px-6 shadow-sm"
                  >
                    採点する
                  </Button>
                )}

                {submitted && !passed && (
                  <Button
                    size="lg"
                    onClick={handleRetry}
                    className="rounded-2xl px-6 shadow-sm bg-amber-600 hover:bg-amber-700"
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" /> 再挑戦（新しい15問）
                  </Button>
                )}

                {submitted && passed && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="secondary"
                      onClick={handleRetry}
                      className="rounded-2xl px-6 shadow-sm"
                    >
                      もう一度受ける
                    </Button>
                    <span className="text-sm text-zinc-500">※満点のため終了可能です</span>
                  </div>
                )}
              </CardFooter>
            </Card>

            <p className="mt-6 text-xs text-zinc-500">
              ※ 本教材は社内研修用です。法令の運用・地域ルールに関する実務判断は所属自治体の最新要領等を確認してください。
            </p>
          </TabsContent>

          <TabsContent value="summary">
            {!unlocked ? (
              <Card className="border-amber-200/60 shadow-sm">
                <CardHeader>
                  <CardTitle>集計（管理者用）</CardTitle>
                  <CardDescription>パスコードを入力すると集計を表示します。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto] max-w-xl">
                    <Input type="password" placeholder="パスコード" value={passcode} onChange={(e)=>setPasscode(e.target.value)} />
                    <Button onClick={tryUnlock}>表示する</Button>
                    {saveStatus === "wrong" && <p className="text-xs text-rose-600 md:col-span-2">パスコードが違います。</p>}
                    <p className="text-xs text-zinc-500 md:col-span-2">※ 集計は管理者のみ閲覧可能です。</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="border-zinc-200 shadow-sm">
                  <CardHeader>
                    <CardTitle>集計</CardTitle>
                    <CardDescription>このブラウザに保存されている受験結果の一覧です。必要に応じてCSVをエクスポートしてください。</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {results.length === 0 ? (
                      <p className="text-sm text-zinc-500">まだデータがありません。まずはテストを実行し「採点する」を押してください。</p>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="rounded-xl border bg-white p-4"><div className="text-zinc-500">記録件数</div><div className="text-2xl font-semibold tabular-nums">{results.length}</div></div>
                          <div className="rounded-xl border bg-white p-4"><div className="text-zinc-500">平均正答率</div><div className="text-2xl font-semibold tabular-nums">{avgAccuracy}%</div></div>
                          <div className="rounded-xl border bg-white p-4"><div className="text-zinc-500">満点率</div><div className="text-2xl font-semibold tabular-nums">{passRate}%</div></div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">受信日時</th>
                                <th className="text-left p-2">所属</th>
                                <th className="text-left p-2">氏名</th>
                                <th className="text-right p-2">得点</th>
                                <th className="text-right p-2">出題数</th>
                                <th className="text-left p-2">合否</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.map((r, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="p-2">{new Date(r.timestamp).toLocaleString('ja-JP', { hour12: false })}</td>
                                  <td className="p-2">{r.dept}</td>
                                  <td className="p-2">{r.fullName}</td>
                                  <td className="p-2 text-right tabular-nums">{r.score}</td>
                                  <td className="p-2 text-right tabular-nums">{r.total}</td>
                                  <td className="p-2">{r.score === r.total ? '合格' : '未合格'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex gap-3">
                      <Button onClick={exportAll}>CSVエクスポート</Button>
                      <Button variant="destructive" onClick={()=>{ setDelStatus('idle'); setDelAsk(v=>!v); }} disabled={results.length===0}>全件削除</Button>
                    </div>
                    {delAsk && (
                      <div className="w-full md:w-auto flex items-center gap-2">
                        <Input type="password" placeholder="パスコード" value={delCode} onChange={(e)=>setDelCode(e.target.value)} className="md:w-56" />
                        <Button variant="destructive" onClick={doDeleteAll}>削除実行</Button>
                        {delStatus === 'wrong' && <span className="text-xs text-rose-600">パスコードが違います</span>}
                        {delStatus === 'ok' && <span className="text-xs text-emerald-700">削除しました</span>}
                      </div>
                    )}
                  </CardFooter>
                </Card>

                <Card className="mt-6 border-amber-200/60 shadow-sm">
                  <CardHeader>
                    <CardTitle>Google シート連携（Webhook）</CardTitle>
                    <CardDescription>GAS ウェブアプリの URL（末尾は <code>?token=kanda2255_Training_7gP4vY9xL2wQ0nH3tF5Z</code>）を保存すると、採点時に自動送信します。</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!unlocked ? null : (
                      <>
                        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                          <Input value={webhookUrl} onChange={(e)=>setWebhookUrl(e.target.value)} placeholder="https://script.google.com/macros/s/XXXX/exec?token=kanda2255_Training_7gP4vY9xL2wQ0nH3tF5Z" />
                          <Button onClick={saveWebhook}>保存</Button>
                        </div>
                        <div className="mt-1 text-xs">
                          {saveStatus === "ok" && <span className="text-emerald-700">保存しました（このブラウザに保持）</span>}
                          {saveStatus === "session" && <span className="text-amber-700">保存しました（このセッションのみ）</span>}
                          {saveStatus === "error" && <span className="text-rose-700">保存に失敗しました。URLを控えてください。</span>}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div id="print-area" className="hidden">
          {submitted && (
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold mb-4">高齢者虐待防止・権利擁護 e-learning｜採点結果</h1>
              <p className="mb-2">受講者：{dept} ／ {fullName}</p>
              <p className="mb-4">得点：{score} / {quizQuestions.length}　｜　{new Date().toLocaleString('ja-JP', { hour12: false })}</p>
              <ol className="space-y-4">
                {quizQuestions.map((q, qi) => (
                  <li key={q.id} className="">
                    <div className="font-semibold mb-1">第{qi + 1}問．{q.text}</div>
                    <div className="mb-1"><span className="font-medium">回答：</span>{answers[qi] !== null ? `${answers[qi] + 1}. ${q.choices[answers[qi]]}` : '未回答'}</div>
                    <div className="text-zinc-800"><span className="font-medium">解説：</span>{q.explanation}</div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <style>{`@media print { body * { visibility:hidden !important; } #print-area, #print-area * { visibility:visible !important; } #print-area { position:absolute; inset:0; padding:24px; background:#fff; color:#000; } }`}</style>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-center text-xs text-zinc-500">
        高齢者あんしんセンター神田　浜田作成
      </footer>
    </div>
  );
}
