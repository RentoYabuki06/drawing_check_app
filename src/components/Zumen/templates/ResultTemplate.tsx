"use client";

import { Button, Stack, Typography } from "@mui/material";

export const ResultTemplate = (p: {
  onPrev: () => void;
  onSubmit: () => void;
}) => {
  const { onPrev, onSubmit } = p;

  return (
    <>
      <Stack height="100%">
        <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
          「送信」ボタンを押すと図面の検査が始まります（数分かかる場合があります）
        </Typography>
        
      </Stack>

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
        <Button variant="contained" color="primary" onClick={onSubmit}>
          送信
        </Button>
      </Stack>
    </>
  );
};
