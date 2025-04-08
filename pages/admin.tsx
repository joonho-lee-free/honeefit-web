import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export default function AdminDashboard() {
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [productsText, setProductsText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔐 로그인 확인
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        fetchEntries();
        setLoading(false);
      }
    });
  }, []);

  const fetchEntries = async () => {
    const snapshot = await getDocs(collection(db, "recommendations"));
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEntries(docs);
  };

  const handleSubmit = async () => {
    if (!type || !region || !productsText) return;
    const products = productsText.split("\n").map((p) => p.trim()).filter(Boolean);
    await addDoc(collection(db, "recommendations"), {
      type,
      region,
      products,
      imageUrl
    });
    setType("");
    setRegion("");
    setProductsText("");
    setImageUrl("");
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "recommendations", id));
    fetchEntries();
  };

  if (loading) return <p className="p-6">관리자 인증 확인 중...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <h1 className="text-2xl font-bold mb-4">관리자 상품 등록</h1>

      <button
        onClick={() => signOut(getAuth()).then(() => router.push("/login"))}
        className="absolute top-4 right-4 text-sm text-blue-600 underline"
      >
        🔓 로그아웃
      </button>

      <div className="mb-6 bg-white shadow p-4 rounded-xl">
        <label className="block mb-2">유형</label>
        <input value={type} onChange={(e) => setType(e.target.value)} className="w-full border p-2 mb-4 rounded" />

        <label className="block mb-2">지역</label>
        <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border p-2 mb-4 rounded" />

        <label className="block mb-2">상품 목록 (한 줄에 하나씩)</label>
        <textarea
          value={productsText}
          onChange={(e) => setProductsText(e.target.value)}
          rows={5}
          className="w-full border p-2 rounded mb-4"
        />

        <label className="block mb-2">이미지 URL</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          등록하기
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">📋 등록된 추천 상품</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="border p-4 rounded-xl bg-white shadow">
            <p className="text-sm text-gray-500 mb-1">유형: {entry.type}</p>
            <p className="text-lg font-bold mb-1">📍 {entry.region}</p>
            {entry.imageUrl && (
              <img src={entry.imageUrl} alt="대표 이미지" className="w-32 h-20 object-cover rounded mb-2" />
            )}
            <ul className="list-disc ml-5 mb-2">
              {entry.products.map((p: string, i: number) => <li key={i}>{p}</li>)}
            </ul>
            <button
              onClick={() => handleDelete(entry.id)}
              className="text-sm text-red-600 hover:underline"
            >
              삭제하기
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
