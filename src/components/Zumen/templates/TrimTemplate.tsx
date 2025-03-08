"use client";

import { Button, ImageList, ImageListItem, Stack, Typography } from "@mui/material";
import { useImageTrim } from "./trim/useImageTrim";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import React from "react";
import Image from 'next/image';

interface TrimRequirement {
  label: string;
  dependentChecks: number[];  // どのチェックに必要かを示す
}

const TRIM_REQUIREMENTS: TrimRequirement[] = [
  { label: "部品表", dependentChecks: [1, 2] },        // チェック1と2に必要
  { label: "部品配置箇所", dependentChecks: [1] },     // チェック1のみに必要
  { label: "部品対応表", dependentChecks: [2] },       // チェック2のみに必要
  { label: "寸法チェック箇所", dependentChecks: [3] }, // チェック3のみに必要
];

const TrimTemplate = (props: {
  onPrev: () => void;
  onSubmit: () => void;
}) => {
  const { onPrev, onSubmit } = props;
  const { watch, setValue } = useFormContext();
  const imageUrls: string[] = watch("imageUrl");
  const trimmedImages: string[] = watch("trimmedImages");
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // チェックボックスの状態を取得（チェック4は除外）
  const check1: boolean = watch("check1");
  const check2: boolean = watch("check2");
  const check3: boolean = watch("check3");

  // アクティブなチェックの配列を生成
  const activeChecks = [
    { num: 1, active: check1 },
    { num: 2, active: check2 },
    { num: 3, active: check3 },
  ].filter(check => check.active).map(check => check.num);

  // 必要なトリミングラベルを動的に生成
  const getActiveTrimLabels = () => {
    return TRIM_REQUIREMENTS.filter(req => 
      req.dependentChecks.some(checkNum => 
        activeChecks.includes(checkNum)
      )
    ).map(req => req.label);
  };

  const activeTrimLabels = getActiveTrimLabels();
  const requiredTrims = activeTrimLabels.length;

  const { TrimComponent, handleTrim: originalHandleTrim } = useImageTrim({
    imageSrc: imageUrls[currentPageIndex],
    defaultTrimmedImages: trimmedImages,
    onChangeTrimmedImages: (images) => {
      setValue("trimmedImages", images);
    },
  });

  const handleTrim = () => {
    if (trimmedImages.length >= requiredTrims) {
      alert(`選択された検証項目に必要なトリミングは${requiredTrims}枚です。\n${activeTrimLabels.map((label, index) => `${index + 1}. ${label}`).join('\n')}`);
      return;
    }
    originalHandleTrim();
  };

  // 次のステップへ進める条件
  const canProceed = trimmedImages.length === requiredTrims || requiredTrims === 0;

  return (
    <>
      <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
        {requiredTrims > 0 ? (
          <>
            以下の順序でトリミングしてください（現在の対象が青色背景で表示されます）
            <br />
            {activeTrimLabels.map((label, index) => (
              <React.Fragment key={index}>
                {index + 1}. {" "}
                <Typography
                  component="span"
                  variant="h5"
                  fontWeight="bold"
                  color={trimmedImages.length === index ? "primary" : "inherit"}
                  sx={{
                    ...(trimmedImages.length === index && {
                      backgroundColor: (theme) => theme.palette.primary.light,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      color: 'white'
                    })
                  }}
                >
                  {label}
                </Typography>
                <br />
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            選択された検証項目ではトリミングは不要です
          </>
        )}
      </Typography>

      {requiredTrims > 0 && (
        <>
          <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
            {imageUrls.map((_, index) => (
              <Button
                key={index}
                variant={currentPageIndex === index ? "contained" : "outlined"}
                onClick={() => setCurrentPageIndex(index)}
              >
                ページ {index + 1}
              </Button>
            ))}
          </Stack>

          <Stack height="60%" direction="row">
            <Stack height="100%" width="50%">
              <Typography variant="subtitle1" mb={1} textAlign="center">
                現在のページ: {currentPageIndex + 1} / {imageUrls.length}
              </Typography>
              <TrimComponent />
            </Stack>
            <Stack width="50%">
              <Typography variant="subtitle1" mb={1} textAlign="center">
                トリミング済み画像
              </Typography>
              <ImageList 
                cols={2} 
                sx={{ 
                  height: '100%',
                  overflow: 'auto',
                  gap: '16px !important',
                  padding: '8px'
                }}
              >
                {trimmedImages.map((image, index) => (
                  <ImageListItem 
                    key={index} 
                    sx={{ 
                      height: '250px !important',
                      position: 'relative',
                      '&:not(:last-child)': {
                        marginBottom: '16px'
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#f5f5f5'
                      }}
                    >
                      <Image
                        src={image}
                        alt={`trimmed-${index}`}
                        layout="fill"
                        objectFit="contain"
                        loading="lazy"
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                      <Stack
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        p={1}
                        bgcolor="rgba(0, 0, 0, 0.5)"
                        color="white"
                        zIndex={1}
                      >
                        <Typography variant="caption" textAlign="center">
                          {activeTrimLabels[index] || `トリミング ${index + 1}`}
                        </Typography>
                      </Stack>
                    </div>
                  </ImageListItem>
                ))}
              </ImageList>
            </Stack>
          </Stack>
        </>
      )}

      <Stack
        height={200}
        alignItems="center"
        justifyContent="center"
        direction="row"
        gap={2}
      >
        <Button variant="outlined" color="primary" onClick={onPrev}>
          前のステップへ
        </Button>
        {requiredTrims > 0 && (
          <Button variant="contained" color="primary" onClick={handleTrim}>
            トリミング実行
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          disabled={!canProceed}
          onClick={onSubmit}
        >
          次のステップへ
        </Button>
      </Stack>
    </>
  );
};

export default TrimTemplate;
