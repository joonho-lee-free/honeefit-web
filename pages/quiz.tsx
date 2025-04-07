import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const questions = [
  {
    q: "여행에서 가장 기대하는 것은?",
    options: ["휴식과 힐링", "모험과 체험", "예쁜 사진", "럭셔리한 리조트"]
  },
  {
    q: "선호하는 숙소 타입은?",
    options: ["수상 풀빌라", "감성 숙소", "도심 호텔", "프라이빗 풀빌라"]
  },
  {
    q: "하고 싶은 액티비티는?",
    options: ["해양 스포츠", "자연 체험", "시티투어 & 쇼핑", "스냅사진 촬영"]
  },
  {
    q: "여행 스타일은?",
    options: ["자유여행", "패키지", "혼합형", "즉흥형"]
  },
  {
    q: "예산은?",
    options: ["200 이하", "200~400", "400~600", "600 이상"]
  },
  {
    q: "선호 여행 지역은?",
    options: ["몰디브/세이셸", "유럽", "동남아", "일본/국내"]
  }
];

export default function Quiz() {
  const [step, setStep] = useState(0); // ✅ 필수 선언!
  const [answers, setAnswers] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[step] = option;
    setAnswers(newAnswers);
  };

  const next = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      try {
        await addDoc(collection(db, "quizResponses"), {
          answers,
          createdAt: serverTimestamp()
        });
        alert("응답이 저장되었습니다!");
        window.location.href = "/result";
      } catch (error) {
        alert("저장 실패 😥");
        console.error(error);
      }
    }
  };

  const current = questions[step];

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Q{step + 1}. {current.q}</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {current.options.map((opt) => (
          <li key={opt} style={{ marginBottom: "10px" }}>
            <label>
              <input
                type="radio"
                name={`q${step}`}
                value={opt}
                checked={answers[step] === opt}
                onChange={() => handleSelect(opt)}
              />
              {" "}{opt}
            </label>
          </li>
        ))}
      </ul>
      <button
        onClick={next}
        disabled={!answers[step]}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        {step === questions.length - 1 ? "제출" : "다음"}
      </button>
    </div>
  );
}
