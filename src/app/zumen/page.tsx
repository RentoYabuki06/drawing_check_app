"use client";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import outputs from "../../../amplify_outputs.json";

import React, { useState, useEffect } from "react";
import { Stack, Step, StepLabel, Stepper } from "@mui/material";
import { UploadTemplate } from "@/components/Zumen/templates/UploadTemplate";
import TrimTemplate from "@/components/Zumen/templates/TrimTemplate";
import { ResultTemplate } from "@/components/Zumen/templates/ResultTemplate";
import { FormProvider, useForm } from "react-hook-form";
import { Schema } from "../../../amplify/data/resource";
import { CheckResults } from "@/components/Zumen/templates/CheckResults";

const steps = ["アップロード・検査項目選択", "図面トリミング", "結果出力"];

interface Form {
  imageUrl: string;
  imageUrl_additional: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  trimmedImages: string[];
}

const defaultValues: Form = {
  imageUrl: "",
  imageUrl_additional: "",
  check1: true,
  check2: true,
  check3: true,
  check4: true,
  trimmedImages: []
};

Amplify.configure(outputs, { ssr: true });
const client = generateClient<Schema>();

// 新しい型定義
interface CheckProcessConfig {
  requiredImageCount: number;
  message: string;
  images: string[];
  resultPrefix: string;
}

// 結果の型定義を追加
interface AnalysisResults {
  mappingResult: string | null;
  partListResult: string | null;
  dimensionResult: string | null;
  specificationResult: string | null;
  partListResult1: string | null;
  partListResult2: string | null;
  partListResult3: string | null;
}

// 共通の画像処理関数
const convertImagesToBase64 = async (images: string[]): Promise<string[]> => {
  try {
    return await Promise.all(
      images.map(async (image) => {
        // すでにBase64形式の場合
        if (image.startsWith('data:image/')) {
          return image.split(',')[1];
        }

        const response = await fetch(image);
        if (!response.ok) {
          throw new Error(`画像の取得に失敗しました: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (!reader.result) {
              reject(new Error('画像の読み込みに失敗しました'));
              return;
            }
            const base64Data = (reader.result as string).split(',')[1];
            resolve(base64Data);
          };
          reader.onerror = () => reject(new Error('ファイルの読み込み中にエラーが発生しました'));
          reader.readAsDataURL(blob);
        });
      })
    );
  } catch (error) {
    console.error('画像変換エラー:', error);
    throw new Error(`画像の変換中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
  }
};

// 共通のチェックプロセス処理
const handleCheckProcess = async (
  config: CheckProcessConfig,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  resultType: keyof AnalysisResults,
  setAnalysisResults: React.Dispatch<React.SetStateAction<AnalysisResults>>
): Promise<void> => {
  console.log('handleCheckProcess開始:', {
    resultType,
    config
  });

  try {
    if (config.images.length < config.requiredImageCount) {
      throw new Error(`画像が${config.requiredImageCount}枚必要です`);
    }

    const imagesBase64 = await convertImagesToBase64(config.images);

    const { data, errors } = await client.queries.generateHaiku({
      prompt: config.message,
      images: JSON.stringify(imagesBase64)
    });

    if (errors) {
      console.error('API エラー:', errors);
      throw new Error(`API エラー: ${JSON.stringify(errors)}`);
    }

    if (!data) {
      throw new Error('レスポンスデータが空です');
    }

    setAnalysisResults((prev: AnalysisResults) => ({
      ...prev,
      [resultType]: data
    }));

    console.log('handleCheckProcess結果:', {
      resultType,
      result: data
    });

    // setAnalysisResultsが正しく呼び出されているか
    console.log('setAnalysisResults呼び出し:', resultType, data);

  } catch (error) {
    console.error('handleCheckProcess エラー:', {
      resultType,
      error
    });
    console.error('エラーの詳細:', {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
};

const ZumenPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  // 個別の結果を保持するように変更
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults>({
    mappingResult: null,
    partListResult: null,
    dimensionResult: null,
    specificationResult: null,
    partListResult1: null,
    partListResult2: null,
    partListResult3: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const methods = useForm<Form>({ defaultValues });

  const handleNextStep = () => {
    setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    if (activeStep === 0) return;
    // 前のステップに戻る際に結果をクリア
    setAnalysisResults({
      mappingResult: null,
      partListResult: null,
      dimensionResult: null,
      specificationResult: null,
      partListResult1: null,
      partListResult2: null,
      partListResult3: null,
    });
    // ローディング状態もリセット
    setIsLoading(false);
    // 経過時間もリセット
    setElapsedTime(0);
    // ステップを戻す
    setActiveStep(activeStep - 1);
  };

  const handleCheck1Process = async () => {
    const trimmedImages = methods.getValues().trimmedImages;
    if (!trimmedImages[0]) {
      throw new Error('1枚目の画像（部品表）が必要です');
    }
    if (!trimmedImages[1]) {
      throw new Error('2枚目の画像（部品配置図面）が必要です');
    }

    await handleCheckProcess(
      {
        requiredImageCount: 2,
        message: `
一番最初に結論となる「結果：問題あり」「結果：問題なし」を出力して、その後にどのような観点でチェックしたか、どのような問題があったかを出力してください。
1つ目の画像が部品表で、2つ目の画像が部品を配置した図面です。
以下の2つの手順の処理を順番に行なってください。

手順1. 1枚目の部品表を読み取ってください。
‧省略しないでください。空⽩の⾏も空⽩として出⼒してください。
‧備考の⽂字は⼩さい場合があります。漏らさず読み取ってください。全件読み取れたか再度確認してください。

‧結果の出⼒は表のみとしてください。
‧markdownの表形式で出⼒してください。
手順2. 2枚目の画像から部品を表す①のような数字記号を全て読み取ってください。
ただし、以下に注意してください。
‧図⾯の読み取る数値‧記号は①②のように丸の中に数値が書いてあるものと、A1のように丸の中にアルファベットや数値が
‧結果は、markdownの表形式として出⼒してください。省略せずに全件1列で出⼒してください。
‧出⼒は表のみとしてください。部品の抜け漏れがないか、1つずつの部品に対して検証して。
   もし抜けなど問題がある部品があれば、日本語で1つずつ何が問題か出力してください。

※ 明らかに部品表や部品を配置した図面ではない場合、1枚目と2枚目が同じ画像の場合などはその旨を指摘してください。

また、その部品が2枚目の部品表に存在するかどうかを検証して。
もし抜けなど問題がある部品があれば、日本語で1つずつ何が問題か出力してください。`,
        images: trimmedImages.slice(0, 2),
        resultPrefix: '部品マッピング結果：'
      },
      client,
      'mappingResult',
      setAnalysisResults
    );
  };

  const handleCheck2Process = async () => {
    console.log('部品対応表チェック開始');
    
    // analysisResultsの現在の状態を確認
    console.log('処理開始時のanalysisResults:', analysisResults);  // stateから直接参照

    const trimmedImages = methods.getValues().trimmedImages;
    if (!trimmedImages[0]) {
      console.error('エラー: 1枚目の部品表が未指定');
      throw new Error('1枚目の部品表が必要です');
    }
    if (!trimmedImages[2]) {
      console.error('エラー: 3枚目の部品表が未指定');
      throw new Error('3枚目の部品表が必要です');
    }

    try {
      // 手順1の実行
      console.log('手順1開始: 1枚目の部品表読み取り');
      await handleCheckProcess(
        {
          requiredImageCount: 1,
          message: `
1枚目の部品表を読み取ってください。
‧省略しないでください。空⽩の⾏も空⽩として出⼒してください。
‧備考の⽂字は⼩さい場合があります。漏らさず読み取ってください。全件読み取れたか再度確認してください。
‧markdownの表形式で出⼒してください。
‧結果の出⼒は表のみとしてください。`,
          images: [trimmedImages[0]],
          resultPrefix: '1枚目の部品表：'
        },
        client,
        'partListResult1', // 結果を個別に保存
        setAnalysisResults
      );
      console.log('手順1完了');

      // 手順2の実行
      console.log('手順2開始: 2枚目の部品表読み取り');
      await handleCheckProcess(
        {
          requiredImageCount: 1,
          message: `
2枚目の表の「部番」「部品名称」「図⾯番号」「数量」を読み取ってください。
‧部番が空欄でも、部品名称や図⾯番号が指定されていることがあります。部番を空欄のまま読み取ってください。
‧⾔語は⽇本語です。特殊なフォントを⽤いる可能性があるので、注意深く読み取ってください。
‧省略しないでください。空⽩の⾏も空⽩として出⼒してください。
‧markdownの表形式で出⼒してください。
‧結果の出⼒は表のみとしてください。`,
          images: [trimmedImages[2]],
          resultPrefix: '2枚目の部品表：'
        },
        client,
        'partListResult2', // 結果を個別に保存
        setAnalysisResults
      );
      console.log('手順2完了');

      // 手順3の実行（比較分析）
      console.log('手順3開始: 比較分析');
      const result = await handleCheckProcess(
        {
          requiredImageCount: 2,
          message: `
手順1と手順2の結果をもとに、部品表に書かれている各「図⾯番号」「部品名称」「数量」の値が、図⾯の表の「品⽬コード」「品⽬名」「数量」と⼀致しているか確認してください。
以下に気を付けてください：
‧部品名称と品⽬名は同じ名称でも漢字やカタカナに変換されているケースがあります。その場合は同⼀と扱ってください。
‧図⾯番号の-(ハイフン)は無視してください。
‧444X12などの表記は444*12と記載される場合がありますが、同⼀としてください。
‧図⾯番号と品⽬コード、部品名称と品⽬名、数量と数量がそれぞれ⼀致しているか確認してください。
‧出⼒は、markdownの表形式としてください。各⾏で内容が⼀致したかどうか、⼀致しない場合はその理由を記述してください。
‧表は省略せず、部品表全⾏に対して結果を出⼒してください。
もし抜けなど問題がある部品があれば、日本語で1つずつ何が問題か出力してください。

最後に、全体の結論として「結果：問題あり」または「結果：問題なし」を出力してください。`,
          images: [trimmedImages[0], trimmedImages[2]],
          resultPrefix: '比較分析結果：'
        },
        client,
        'partListResult3', // 結果を個別に保存
        setAnalysisResults
      );
      
      // 結果を確認するログ
      console.log('check2の処理結果:', result);
      console.log('処理後のanalysisResults:', analysisResults);  // stateから直接参照

    } catch (error) {
      console.error('部品対応表チェックでエラー発生:', error);
      console.error('エラーの詳細:', {
        name: error instanceof Error ? error.name : 'Unknown Error',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      throw error;
    }
  };

  const handleCheck3Process = async () => {
    const trimmedImages = methods.getValues().trimmedImages;
    if (!trimmedImages[3]) {
      throw new Error('4枚目の画像（部品配置図面）が必要です');
    }

    await handleCheckProcess(
      {
        requiredImageCount: 1,
        message: `
一番最初に結論となる「結果：問題あり」「結果：問題なし」を出力して、その後にどのような観点でチェックしたか、どのような問題があったかを出力してください。
こちらの写真が部品を配置した図面です。
そもそも部品の寸法が書かれている図面かどうか判定し、もし違う場合はその旨を出力してください。
もし部品の寸法が書かれている図面であれば、以下の6点を順番に処理してください。


1.加工・製造する際に、必要不可欠な寸法が明瞭に指示されていますか。抜けている箇所があれば、明示してください。

2.対象物の大きさ、姿勢及び位置を最も明確に表すために必要で十分な寸法は抜け漏れなく記載されていますか？抜けている箇所があればその箇所を明示してください。

3.寸法は、寸法線、寸法補助線、寸法補助記号などを用いて、寸法数値によって示します。寸法線、寸法補助線、寸法補助記号の抜けがあれば、その箇所を明示してください。

4.加工又は組立の際に，基準とする形体がある場合には，その形体を基にして寸法を記入する必要があります。抜けている箇所があれば、その箇所を明示してください。

5.寸法は，なるべく工程ごとに配列を分けて記入する。適切な記入方法でない箇所があれば、明示してください。

6.円弧の部分の寸法は，円弧が180°までは半径で表し，それを超える場合には直径で表します。ただし，円弧が180°以内であっても，機能上又は加工上，特に直径の寸法を必要とするものに対しては，直径の寸法を記入します。上記ルールに適合しない箇所があれば明示してください。


※ 明らかに部品表や部品を配置した図面ではない場合、1枚目と2枚目が同じ画像の場合などはその旨を指摘してください。`,
        images: [trimmedImages[3]],
        resultPrefix: '寸法チェック結果：'
      },
      client,
      'dimensionResult',
      setAnalysisResults
    );
  };
  
  const handleCheck4Process = async () => {
    const additionalImage = methods.getValues().imageUrl_additional;
    if (!additionalImage) {
      throw new Error('仕様書の画像が必要です');
    }

    const allImages = [
      ...methods.getValues().trimmedImages,
      ...(Array.isArray(additionalImage) ? additionalImage : [additionalImage])
    ];

    await handleCheckProcess(
      {
        requiredImageCount: 2,
        message: `
一番最初に結論となる「結果：問題あり」「結果：問題なし」を出力して、その後にどのような観点でチェックしたか、どのような問題があったかを出力してください。
自社規格に則って、図面に問題がないかどうかを判断してください。

【画像の説明】
・前半：検証対象の図面PDFを画像に変換したもの
・後半：自社規格書のPDFを画像に変換したもの

以下の点について確認し、問題があれば指摘してください：

1. 寸法の整合性
2. 規格との適合性
3. 特記事項や注意点

【出力内容】
・どのような観点でチェックしたか
・どのような問題があったか

※ 明らかに図面や規格書ではない場合、または同じ画像が使用されている場合はその旨を指摘してください。`,
        images: (() => {
          console.log('処理する画像一覧:', allImages);
          console.log('画像の総数:', allImages.length, '枚');
          return allImages;
        })(),
        resultPrefix: '自社規格チェック結果：'
      },
      client,
      'specificationResult',
      setAnalysisResults
    );
  };


  const handleSubmit = async () => {
    const { check1, check2, check3, check4 } = methods.getValues();
    
    setAnalysisResults({
      mappingResult: null,
      partListResult: null,
      dimensionResult: null,
      specificationResult: null,
      partListResult1: null,
      partListResult2: null,
      partListResult3: null,
    });
    setIsLoading(true);
    
    try {
      console.log('check1 start');
      if (check1) {
        await handleCheck1Process();
        console.log('check1 end');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log('check2 start');
      if (check2) {
        await handleCheck2Process();
        console.log('check2 end');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log('check3 start');
      if (check3) {
        await handleCheck3Process();
        console.log('check3 end');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      console.log('check4 start');
      if (check4) {
        await handleCheck4Process();
        console.log('check4 end');
      }

    } catch (error) {
      console.error('エラーが発生しました:', error);
      const errorMessage = error instanceof Error && error.message.includes('Too many requests') 
        ? 'サーバーが混雑しています。しばらく待ってから再度お試しください。'
        : error instanceof Error ? error.message : '不明なエラー';
      
      setAnalysisResults(prev => ({
        ...prev,
        mappingResult: `エラーが発生しました：\n${errorMessage}`
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      setElapsedTime(0); // ローディング開始時にリセット
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  // activeStepが変更されたときにページトップにスクロールする
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // スムーズスクロール
    });
  }, [activeStep]);

  // useEffectをreturnの前に移動
  useEffect(() => {
    console.log("最終画面でのanalysisResults:", analysisResults);
  }, [analysisResults]);

  return (
    <>
      <Stack my={4}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Stack>

      {/* <Button onClick={testButton}>test</Button> */}

      <Stack height="100%">
        <FormProvider {...methods}>
          {activeStep === 0 && <UploadTemplate onSubmit={handleNextStep} />}
          {activeStep === 1 && (
            <TrimTemplate onPrev={handlePrevStep} onSubmit={handleNextStep} />
          )}
          {activeStep === 2 && (
            <ResultTemplate onPrev={handlePrevStep} onSubmit={handleSubmit} />
          )}
        </FormProvider>
      </Stack>

      {isLoading && (
        <div className="flex items-center justify-center">
          <span className="text-gray-600">
            処理中... {elapsedTime}秒経過
          </span>
        </div>
      )}

      <CheckResults 
        analysisResults={analysisResults} 
        methods={methods}
      />
    </>
  );
};

export default ZumenPage;

