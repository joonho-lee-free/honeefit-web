import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";

export default function AdminDashboard() {
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [productsText, setProductsText] = useState("");
  const [entries, setEntries] = useState<any[]>([]);

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
      products
    });
    setType("");
    setRegion("");
    setProductsText("");
    fetchEntries();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "recommendations", id));
    fetchEntries();
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">관리자 상품 등록</h1>

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
