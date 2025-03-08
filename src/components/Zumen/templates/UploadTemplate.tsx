"use client";

import FileUploader from "@/components/FileUploader";
import {
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import React from "react";
import * as pdfjsLib from "pdfjs-dist";
import { useFormContext } from "react-hook-form";
import Image from "next/image";
import { PDFUploadTemplate } from "./PDFUploadTemplate";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const UploadTemplate = (props: { onSubmit: () => void }) => {
  const { onSubmit } = props;
  const { setValue, watch } = useFormContext();

  const uploadedImageUrl = watch("imageUrl");
  const uploadedImageUrl_additional = watch("imageUrl_additional");
  const isOK = !!uploadedImageUrl;

  const checkItems = [
    { key: "check1", label: "部品マッピングチェック" },
    { key: "check2", label: "部品対応表チェック" },
    { key: "check3", label: "寸法抜け漏れチェック" },
    { key: "check4", label: "自社規格チェック" },
  ];

  const handleCheck = (key: string) => {
    setValue(key, !watch(key));
  };

  /** PDFを画像に変換 */
  const convertPdfToImage = async (pdfFile: File, isAdditional: boolean = false) => {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
      try {
        const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
        const loadingTask = pdfjsLib.getDocument(typedArray);
        const pdf = await loadingTask.promise;
        const pageCount = pdf.numPages;
        
        const imageUrls: string[] = [];
        
        // 全ページを処理
        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          
          if (!context) {
            throw new Error("Canvas context could not be created");
          }
          
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: context, viewport }).promise;
          const imageDataUrl = canvas.toDataURL("image/png");
          imageUrls.push(imageDataUrl);
        }
        
        // 画像URLの配列を保存
        setValue(
          isAdditional ? "imageUrl_additional" : "imageUrl",
          imageUrls
        );
      } catch (error) {
        console.error("PDF変換エラー:", error);
        // エラー処理を追加
      }
    };

    fileReader.readAsArrayBuffer(pdfFile);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    await convertPdfToImage(file, false);
  };

  const handleFileChange2 = async (file: File | null) => {
    if (!file) return;
    await convertPdfToImage(file, true);
  };

  const handleSubmit = () => {
    if (!isOK) return;

    // チェックボックスが1つも選択されていないかチェック
    const isAnyCheckSelected = checkItems.some(item => watch(item.key));
    if (!isAnyCheckSelected) {
      alert("少なくとも1つのチェック項目を選択してください。");
      return;
    }

    // 自社規格チェックのみが選択されている場合をチェック
    const selectedChecks = checkItems.filter(item => watch(item.key));
    if (selectedChecks.length === 1 && watch("check4")) {
      alert("自社規格チェックのみの選択はできません。\n他のチェック項目と組み合わせて選択してください。");
      return;
    }

    // 自社規格チェックが選択されているのに、追加PDFがアップロードされていない場合
    if (watch("check4") && !uploadedImageUrl_additional) {
      alert("自社規格チェックを行う場合は、仕様書のアップロードが必要です。");
      return;
    }

    // 仕様書PDFがアップロードされているのに、自社規格チェックが選択されていない場合
    if (uploadedImageUrl_additional && !watch("check4")) {
      alert("仕様書がアップロードされていますが、自社規格チェックが選択されていません。\n仕様書を使用する場合は、自社規格チェックを選択してください。");
      return;
    }

    onSubmit();
  };

  return (
    <>
      <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
        検査したい図面をアップロードしてください
      </Typography>
      <Stack height="100%" direction="row" sx={{ p: 4 }}>
        <Stack>
          <FileUploader
            onFileSelect={handleFileChange}
            uploadedImageUrl={uploadedImageUrl}
          />
        </Stack>
        <Stack width="40%" p={2}>
          <Stack>チェック項目</Stack>
          <Stack p={2}>
            {checkItems.map((item) => (
              <FormControlLabel
                key={item.key}
                control={
                  <Checkbox
                    checked={watch(item.key)}
                    onChange={() => handleCheck(item.key)}
                  />
                }
                label={item.label}
              />
            ))}
          </Stack>

          {uploadedImageUrl && (
            <Stack>
              <Typography>アップロードした画像（プレビュー）</Typography>
              {Array.isArray(uploadedImageUrl) && uploadedImageUrl.length > 0 ? (
                <Stack mb={2}>
                  <Typography variant="caption">
                    ページ 1
                  </Typography>
                  <Image
                    src={uploadedImageUrl[0]}
                    alt="uploaded-page-1"
                    width={600}
                    height={600}
                    style={{ objectFit: 'contain' }}
                  />
                </Stack>
              ) : (
                <Image
                  src={uploadedImageUrl}
                  alt="uploaded"
                  width={600}
                  height={600}
                  style={{ objectFit: 'contain' }}
                />
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
      <Stack height={200} alignItems="center" justifyContent="center">
        <Button
          disabled={!isOK}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          次のステップへ
        </Button>
      </Stack>

      <Divider 
        sx={{ 
          my: 3,  // 上下のマージン
          width: '100%',  // 幅を100%に
          borderColor: 'grey.300',  // 線の色を少し薄めに
          borderWidth: 1  // 線の太さ
        }} 
      />

      <PDFUploadTemplate
        onFileSelect={handleFileChange2}
        uploadedImageUrl={uploadedImageUrl_additional}
      />

      {/* 追加画像のプレビュー表示 */}
      {uploadedImageUrl_additional && (
        <Stack alignItems="center" mt={2}>
          <Typography variant="subtitle1" mb={1}>
            アップロードした仕様書（プレビュー）
          </Typography>
          {Array.isArray(uploadedImageUrl_additional) && uploadedImageUrl_additional.length > 0 ? (
            <Stack mb={2}>
              <Typography variant="caption">
                ページ 1
              </Typography>
              <Image
                src={uploadedImageUrl_additional[0]}
                alt="uploaded-specification-page-1"
                width={300}
                height={300}
                style={{ objectFit: 'contain' }}
              />
            </Stack>
          ) : (
            <Image
              src={uploadedImageUrl_additional}
              alt="uploaded-specification"
              width={300}
              height={300}
              style={{ objectFit: 'contain' }}
            />
          )}
        </Stack>
      )}

    </>
  );
};
