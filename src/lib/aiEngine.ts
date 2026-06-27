const TOPIC_KEYWORDS: Record<string, string[]> = {
  "Machine Learning": ["machine learning", "makine öğrenmesi", "supervised", "unsupervised", "overfitting", "underfitting", "model", "algoritma", "eğitim", "tahmin"],
  "Data Preprocessing": ["preprocessing", "ön işleme", "normalizasyon", "standardizasyon", "missing value", "eksik veri", "outlier", "aykırı değer", "ölçeklendirme"],
  "Feature Engineering": ["feature", "özellik", "feature selection", "özellik seçimi", "dimensionality", "boyut indirgeme", "pca", "feature extraction"],
  "Regression": ["regression", "regresyon", "linear", "doğrusal", "polynomial", "polinom", "ridge", "lasso", "tahmin", "sürekli"],
  "Classification": ["classification", "sınıflandırma", "sınıf", "kategori", "logistic", "decision tree", "random forest", "svm", "naive bayes"],
  "Neural Networks": ["neural network", "yapay sinir ağı", "deep learning", "derin öğrenme", "cnn", "rnn", "lstm", "transformer", "activation", "katman"],
  "SQL": ["sql", "query", "sorgu", "database", "veritabanı", "join", "select", "insert", "update", "delete", "table", "tablo"],
  "Statistics": ["statistics", "istatistik", "probability", "olasılık", "distribution", "dağılım", "hypothesis", "hipotez", "variance", "varyans", "mean", "ortalama"],
  "Computer Vision": ["computer vision", "bilgisayarla görü", "image", "görüntü", "object detection", "nesne tanıma", "segmentation", "edge detection"],
  "Research Methods": ["research", "araştırma", "methodology", "yöntem", "hypothesis", "literature", "literatür", "survey", "anket", "experiment", "deney"],
  "Optimization": ["optimization", "optimizasyon", "gradient descent", "cost function", "maliyet", "convex", "global minimum", "local minimum"],
  "Data Structures": ["data structure", "veri yapısı", "array", "dizi", "linked list", "bağlı liste", "stack", "kuyruk", "queue", "tree", "ağaç", "graph", "çizge"],
  "Algorithms": ["algorithm", "algoritma", "sorting", "sıralama", "search", "arama", "complexity", "karmaşıklık", "big o", "recursion", "recursive"],
};

export function extractTags(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [tag, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) {
      found.push(tag);
    }
  }
  return [...new Set(found)];
}

function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, "$1|")
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

export function generateSummary(text: string) {
  const sentences = splitSentences(text);
  const short = sentences.length > 0 ? sentences.slice(0, 2).join(" ") : text.slice(0, 200);
  const detailed = sentences.length > 2 ? sentences.slice(0, 5).join(" ") : text.slice(0, 500);
  const bullet = sentences.length > 0 ? sentences.slice(0, Math.min(6, sentences.length)) : [text.slice(0, 120)];
  const examQuick = sentences.length > 0 ? sentences.slice(0, 3).join(" ") : text.slice(0, 250);

  const keyConcepts = extractKeyConcepts(text);

  const beginner = generateBeginnerSummary(text, keyConcepts);

  return {
    short,
    detailed,
    bullet,
    examQuick,
    beginner,
    keyConcepts,
    whatIsItAbout: short,
    mainTopics: keyConcepts.slice(0, 4),
    importantDefinitions: keyConcepts.slice(0, 3).map((c) => ({ term: c, definition: `${c} kavramı, bu konunun temel yapı taşlarından biridir.` })),
    examPoints: bullet.slice(0, 3),
    quickThreeSentence: sentences.slice(0, 3).join(" "),
  };
}

function extractKeyConcepts(text: string): string[] {
  const lower = text.toLowerCase();
  const candidates = Object.values(TOPIC_KEYWORDS).flat();
  const found = candidates.filter((c) => lower.includes(c.toLowerCase()));
  const words = text.split(/\s+/);
  const capitalized = words.filter((w) => w.length > 3 && w[0] === w[0].toUpperCase());
  const all = [...new Set([...found, ...capitalized])];
  return all.slice(0, 8);
}

function generateBeginnerSummary(text: string, concepts: string[]) {
  const sentences = splitSentences(text);
  return {
    whatIsIt: sentences.length > 0 ? sentences[0] : text.slice(0, 150),
    whyImportant: "Bu konu, modern akademik ve profesyonel çalışmalarda sıkça karşılaşılan temel bir yapı taşıdır.",
    simpleExample: concepts.length > 0 ? `${concepts[0]} kavramını günlük hayatta şu şekilde düşünebilirsiniz: Bir arkadaşınızı yüzünden tanıyorsunuz; model de verilerden "yüzleri" tanımayı öğrenir.` : "Günlük hayattan bir örnek vermek gerekirse, bir alışveriş listesi hazırlamak gibi düşünebilirsiniz.",
    analogy: "Bir öğrencinin sadece çözdüğü örnek soruları ezberleyip farklı bir soru gelince zorlanmasına benzer; model de eğitim verisini ezberlerse yeni verilerde başarısız olur.",
    topThreePoints: [
      "Temel kavramları ve tanımları öğrenin.",
      "Kavramlar arasındaki farkları ve ilişkileri anlayın.",
      "Örnekler ve pratik uygulamalarla pekiştirin.",
    ],
    examShort: sentences.slice(0, 2).join(" ") || text.slice(0, 120),
  };
}

export function generateFlashcards(text: string, noteId: string, userId: string) {
  const sentences = splitSentences(text);
  const cards: { note_id: string; user_id: string; question: string; answer: string; difficulty: string; tag: string | null; status: string }[] = [];

  const patterns = [
    { regex: /(\w+\s+\w+(?:\s+\w+)?)\s+nedir\?/gi, type: "definition" },
    { regex: /(\w+\s+\w+(?:\s+\w+)?)\s+ne demek/gi, type: "definition" },
    { regex: /(\w+\s+\w+(?:\s+\w+)?)\s+kullanılır/gi, type: "usage" },
    { regex: /(\w+\s+\w+(?:\s+\w+)?)\s+önemli/gi, type: "importance" },
    { regex: /(\w+\s+\w+(?:\s+\w+)?)\s+avantaj/gi, type: "advantage" },
    { regex: /(\w+\s+\w+(?:\s+\w+)?)\s+dezavantaj/gi, type: "disadvantage" },
    { regex: /(\w+\s+\w+(?:\s+\w+)?)\s+ile\s+(\w+\s+\w+(?:\s+\w+)?)\s+arasındaki\s+fark/gi, type: "difference" },
  ];

  for (const sentence of sentences) {
    for (const pattern of patterns) {
      const matches = sentence.matchAll(pattern.regex);
      for (const match of matches) {
        const term = match[1]?.trim();
        if (!term || term.length < 3) continue;
        let question = "";
        let answer = sentence.length > 200 ? sentence.slice(0, 200) + "..." : sentence;
        if (pattern.type === "definition") {
          question = `${term} nedir?`;
        } else if (pattern.type === "usage") {
          question = `${term} ne zaman / nerede kullanılır?`;
        } else if (pattern.type === "importance") {
          question = `${term} neden önemlidir?`;
        } else if (pattern.type === "advantage") {
          question = `${term} avantajları nelerdir?`;
        } else if (pattern.type === "disadvantage") {
          question = `${term} dezavantajları nelerdir?`;
        } else if (pattern.type === "difference") {
          const term2 = match[2]?.trim();
          question = term2 ? `${term} ile ${term2} arasındaki fark nedir?` : `${term} farkı nedir?`;
        }
        if (question && cards.length < 12) {
          cards.push({
            note_id: noteId,
            user_id: userId,
            question,
            answer,
            difficulty: Math.random() > 0.6 ? "Zor" : Math.random() > 0.3 ? "Orta" : "Kolay",
            tag: extractTags(sentence)[0] || null,
            status: "new",
          });
        }
      }
    }
  }

  if (cards.length < 5) {
    const keywords = extractKeyConcepts(text);
    for (const kw of keywords.slice(0, 8)) {
      if (cards.length >= 12) break;
      cards.push({
        note_id: noteId,
        user_id: userId,
        question: `${kw} nedir?`,
        answer: `${kw}, bu konunun önemli kavramlarından biridir.`,
        difficulty: "Orta",
        tag: extractTags(kw)[0] || null,
        status: "new",
      });
    }
  }

  return cards;
}

export function generateQuizQuestions(text: string, noteId: string, userId: string) {
  const sentences = splitSentences(text);
  const questions: { note_id: string; user_id: string; question: string; type: string; options: string[]; correct_answer: string; explanation: string; difficulty: string; tag: string | null }[] = [];

  const concepts = extractKeyConcepts(text);
  const tags = extractTags(text);

  const distractorsPool = [
    "Veri boyutunu azaltmak için",
    "Modelin hızını artırmak için",
    "Eksik verileri doldurmak için",
    "Hafıza kullanımını optimize etmek için",
    "Sadece görsel veriler için",
    "Sadece metinsel veriler için",
    "Hiçbiri",
  ];

  for (let i = 0; i < Math.min(8, sentences.length); i++) {
    const sentence = sentences[i];
    const concept = concepts[i % concepts.length] || "Bu konu";
    const tag = tags[i % tags.length] || null;

    if (sentence.toLowerCase().includes("nedir") || sentence.toLowerCase().includes("neden")) {
      const correct = sentence.length > 120 ? sentence.slice(0, 120) : sentence;
      const wrong1 = distractorsPool[(i * 2) % distractorsPool.length];
      const wrong2 = distractorsPool[(i * 2 + 1) % distractorsPool.length];
      const wrong3 = distractorsPool[(i * 2 + 3) % distractorsPool.length];
      const opts = shuffle([correct, wrong1, wrong2, wrong3]);
      questions.push({
        note_id: noteId,
        user_id: userId,
        question: `${concept} ile ilgili olarak aşağıdakilerden hangisi doğrudur?`,
        type: "multiple_choice",
        options: opts,
        correct_answer: correct,
        explanation: `Doğru cevap: ${correct}`,
        difficulty: i % 3 === 0 ? "Kolay" : i % 3 === 1 ? "Orta" : "Zor",
        tag,
      });
    }
  }

  if (questions.length < 5) {
    for (let i = questions.length; i < 6; i++) {
      const concept = concepts[i % concepts.length] || "Bu konu";
      const tag = tags[i % tags.length] || null;
      const correct = `${concept}, bu konunun temel bileşenlerinden biridir.`;
      const wrong1 = distractorsPool[(i * 2) % distractorsPool.length];
      const wrong2 = distractorsPool[(i * 2 + 1) % distractorsPool.length];
      const wrong3 = distractorsPool[(i * 2 + 3) % distractorsPool.length];
      const opts = shuffle([correct, wrong1, wrong2, wrong3]);
      questions.push({
        note_id: noteId,
        user_id: userId,
        question: `${concept} hakkında aşağıdakilerden hangisi doğrudur?`,
        type: "multiple_choice",
        options: opts,
        correct_answer: correct,
        explanation: `Doğru cevap: ${correct}`,
        difficulty: i % 3 === 0 ? "Kolay" : i % 3 === 1 ? "Orta" : "Zor",
        tag,
      });
    }
  }

  return questions;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateStudyRecommendations(
  notes: any[],
  flashcards: any[],
  quizQuestions: any[],
  sessions: any[]
): string[] {
  const recs: string[] = [];
  const courseCounts: Record<string, number> = {};
  notes.forEach((n) => {
    courseCounts[n.course_name] = (courseCounts[n.course_name] || 0) + 1;
  });
  const mostStudied = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const reviewCards = flashcards.filter((f) => f.status === "review");
  if (reviewCards.length > 0) {
    recs.push(`${reviewCards.length} flashcard tekrar bekliyor.`);
  }

  const notesWithoutQuiz = notes.filter((n) => !quizQuestions.some((q) => q.note_id === n.id));
  if (notesWithoutQuiz.length > 0) {
    recs.push(`"${notesWithoutQuiz[0].course_name}" dersinde henüz quiz oluşturmadınız.`);
  }

  if (mostStudied) {
    recs.push(`Bu hafta en çok "${mostStudied}" notları üzerinde çalıştınız.`);
  }

  const lowQuizScore = sessions.filter((s) => s.quiz_score < 50);
  if (lowQuizScore.length > 0) {
    recs.push("Quiz başarınız düşük olan konulara tekrar çalışmanız önerilir.");
  }

  if (recs.length === 0) {
    recs.push("Sınav öncesi hızlı tekrar için kısa özet modunu kullanabilirsiniz.");
    recs.push("Yeni notlar yüklemeye devam edin, AI size özet ve flashcard üretsin.");
  }

  return recs;
}
