"use client";

import React from "react";
import { usePathname } from "next/navigation";
import StepButton from "./StepButton";

const TopBar = () => {
  const pathname = usePathname(); // 現在のパスを取得

  // 各ボタンのルートとラベルの定義
  const steps = [
    { label: "アップロード・検査項目選択", path: "/zumen_upload" },
    { label: "図面トリミング", path: "/zumen_trimming" },
    { label: "結果出力", path: "/final_result" },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "0",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#f5f5f5",
        overflow: "hidden", // はみ出し部分を非表示
      }}
    >
      {steps.map((step) => (
        <div
          key={step.path}
          style={{
            flex: "1 1 33.33%", // 各要素を均等に3分割
            whiteSpace: "nowrap", // テキスト折り返しを禁止
            overflow: "hidden", // はみ出し部分を非表示
            textOverflow: "ellipsis", // はみ出し部分を省略記号で表示
            fontSize: "clamp(0.75rem, 2vw, 1rem)", // フォントサイズを画面幅に応じて可変
            textAlign: "center", // テキストを中央揃え
            backgroundColor: pathname === step.path ? "#007bff" : "#e0e0e0", // 背景色を設定
            padding: "10px 0", // パディング追加
          }}
        >
          <StepButton
            label={step.label}
            isActive={pathname === step.path} // 現在のパスと一致するか判定
            // onClick={() => window.location.href = step.path} // ページ遷移処理
          />
        </div>
      ))}
    </div>
  );
};

export default TopBar;
