import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

function getType(answers: string[]) {
  const tags = answers.join(" ");
  if (tags.includes("감성") || tags.includes("스냅")) return "감성형";
  if (tags.includes("휴식") || tags.includes("풀빌라")) return "휴양형";
  if (tags.includes("모험") || tags.includes("액티비티")) return "탐험형";
  if (tags.includes("쇼핑") || tags.includes("도심")) return "도시형";
  if (tags.includes("럭셔리") || tags.includes("600 이상")) return "럭셔리형";
  return "베이직형";
}

const resortDB: Record<string, string[]> = {
  감성형: ["발리 우붓 리조트", "몰디브 푸시파루", "이탈리아 아말피"],
  휴양형: ["몰디브 오젠", "하와이 코올리나", "보라카이 샹그릴라"],
  탐험형: ["뉴질랜드 글램핑", "아이슬란드 링로드", "스위스 산악호텔"],
  도시형: ["도쿄 시부야 호텔", "파리 부티크호텔", "뉴욕 미드타운"],
  럭셔리형: ["세인트레지스 몰디브", "포시즌스 보라보라", "아야나 빌라"]
};

export default function Result() {
  const [type, setType] = useState("");
  const [recommend, setRecommend] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      const q = query(collection(db, "quizResponses"), orderBy("createdAt", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        const answers = data.answers || [];
        const t = getType(answers);
        setType(t);
        setRecommend(resortDB[t] || []);
      }
      setLoading(false);
    };

    fetchLatest();
  }, []);

  if (loading) return <div style={{ padding: "40px" }}>결과 불러오는 중...</div>;

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>당신의 여행 성향은? 💫</h2>
      <h3 style={{ color: "#ff5599" }}>{type}</h3>

      <h4>추천 리조트 ✨</h4>
      <ul>
        {recommend.map((resort) => (
          <li key={resort}>🌴 {resort}</li>
        ))}
      </ul>
    </div>
  );
}

