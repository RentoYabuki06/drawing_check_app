import { Typography, Box } from "@mui/material";
import { UseFormReturn } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface CheckResultProps {
  title: string;
  images: string[];
  result: string;
  imageWidth?: string;
}

const CheckResult = ({ title, images, result, imageWidth = '33.33%' }: CheckResultProps) => {
  // 画像の枚数に基づいて幅を計算
  const calculateWidth = (imagesLength: number) => {
    if (imagesLength === 1) return '100%';
    if (imagesLength === 2) return '50%';
    return '33.33%';  // 3枚以上の場合
  };

  const dynamicWidth = imageWidth === '33.33%' ? calculateWidth(images.length) : imageWidth;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
        〜{title}〜
      </Typography>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ width: '70%' }}>
          <h4 className="font-bold mb-2">使用した画像：</h4>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            minHeight: '200px',
            height: 'auto'
          }}>
            {images.map((image, index) => (
              <div 
                key={index}
                style={{ 
                  width: dynamicWidth,
                  position: 'relative',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  minHeight: '400px',
                  height: 'auto'
                }}
              >
                <TransformWrapper
                  initialScale={1}
                  minScale={0.5}
                  maxScale={4}
                  wheel={{ disabled: false }}
                  pinch={{ disabled: false }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div style={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        zIndex: 10,
                        display: 'flex',
                        gap: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '4px',
                        borderRadius: '4px'
                      }}>
                        <button
                          onClick={() => zoomIn()}
                          style={{
                            padding: '4px 8px',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => zoomOut()}
                          style={{
                            padding: '4px 8px',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        >
                          -
                        </button>
                        <button
                          onClick={() => resetTransform()}
                          style={{
                            padding: '4px 8px',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                          }}
                        >
                          Reset
                        </button>
                      </div>
                      <TransformComponent>
                        <img 
                          src={image} 
                          alt={`検証画像 ${index + 1}`}
                          style={{ 
                            width: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                            objectPosition: 'top'
                          }}
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '30%' }}>
          <h3 className="font-bold mb-2">AI診断結果：</h3>
          <Box sx={{ 
            '& table': {
              borderCollapse: 'collapse',
              width: '100%',
              mb: 2,
              fontSize: '0.9rem'
            },
            '& th, & td': {
              border: '1px solid #ddd',
              padding: '8px',
              textAlign: 'left'
            },
            '& th': {
              backgroundColor: '#f5f5f5'
            },
            '& tr:nth-of-type(even)': {
              backgroundColor: '#fafafa'
            },
            '& p': {
              margin: '0.5rem 0'
            }
          }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({...props}) => (
                  <div style={{ overflowX: 'auto', width: '100%', marginBottom: '1rem' }}>
                    <table {...props} />
                  </div>
                ),
                p: ({...props}) => (
                  <Typography 
                    {...props} 
                    component="p" 
                    sx={{ 
                      my: 2,
                      lineHeight: 1.6 
                    }} 
                  />
                ),
                h3: ({...props}) => (
                  <Typography 
                    {...props} 
                    variant="h6" 
                    sx={{ 
                      mt: 3, 
                      mb: 2, 
                      fontWeight: 'bold' 
                    }} 
                  />
                )
              }}
            >
              {result}
            </ReactMarkdown>
          </Box>
        </div>
      </div>
    </div>
  );
};

// フォームの型定義
interface FormValues {
  imageUrl: string;
  imageUrl_additional: string;
  check1: boolean;
  check2: boolean;
  check3: boolean;
  check4: boolean;
  trimmedImages: string[];
}

interface CheckResultsProps {
  analysisResults: {
    mappingResult: string | null;
    partListResult: string | null;
    partListResult1: string | null;
    partListResult2: string | null;
    partListResult3: string | null;
    dimensionResult: string | null;
    specificationResult: string | null;
  };
  methods: UseFormReturn<FormValues>;  // anyの代わりに具体的な型を使用
}

export const CheckResults = ({ analysisResults, methods }: CheckResultsProps) => {
  if (!Object.values(analysisResults).some(result => result !== null)) return null;

  return (
    <div style={{ 
      marginTop: '1rem',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <Typography variant="h4" fontWeight="bold" mb={2} textAlign="center">
        最終結果（数分かかる場合があります）
      </Typography>

      {/* 部品マッピングチェック */}
      {methods.getValues().check1 && analysisResults.mappingResult && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <CheckResult
            title="部品マッピングチェック結果"
            images={methods.getValues().trimmedImages.slice(0, 2)}
            result={analysisResults.mappingResult}
            imageWidth="80%"
          />
        </div>
      )}

      {/* 部品対応表チェック */}
      {methods.getValues().check2 && (analysisResults.partListResult1 || analysisResults.partListResult2 || analysisResults.partListResult3) && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          {/* 手順1の結果 */}
          {analysisResults.partListResult1 && (
            <CheckResult
              title="部品対応表チェック - step1：1枚目の部品表の読み取り結果"
              images={[methods.getValues().trimmedImages[0]]}
              result={analysisResults.partListResult1}
            />
          )}
          
          {/* 手順2の結果 */}
          {analysisResults.partListResult2 && (
            <CheckResult
              title="部品対応表チェック - step2：2枚目の部品表の読み取り結果"
              images={[methods.getValues().trimmedImages[2]]}
              result={analysisResults.partListResult2}
            />
          )}
          
          {/* 手順3の結果 */}
          {analysisResults.partListResult3 && (
            <CheckResult
              title="部品対応表チェック - step3：1枚目と2枚目の部品表の比較分析"
              images={[
                methods.getValues().trimmedImages[0],
                methods.getValues().trimmedImages[2]
              ]}
              result={analysisResults.partListResult3}
            />
          )}
        </div>
      )}

      {/* 寸法抜け漏れチェック */}
      {methods.getValues().check3 && analysisResults.dimensionResult && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <CheckResult
            title="寸法記載抜けチェック結果"
            images={[methods.getValues().trimmedImages[3]]}
            result={analysisResults.dimensionResult}
          />
        </div>
      )}

      {/* 自社規格チェック */}
      {methods.getValues().check4 && analysisResults.specificationResult && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '2rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <CheckResult
            title="自社規格仕様書チェック結果（自社規格PDFは1枚目のみ表示）"
            images={[
              ...methods.getValues().trimmedImages,
              ...(Array.isArray(methods.getValues().imageUrl_additional) 
                ? [methods.getValues().imageUrl_additional[0]]
                : [methods.getValues().imageUrl_additional])
            ]}
            result={analysisResults.specificationResult}
          />
        </div>
      )}
    </div>
  );
};