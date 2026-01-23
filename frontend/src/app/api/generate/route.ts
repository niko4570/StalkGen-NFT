// API 路由：处理图像生成请求

import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithFlux } from '@/lib/replicate-flux';

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const { prompt, negative_prompt, width, height } = body;

    // 验证必填参数
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // 验证可选参数
    if (negative_prompt && typeof negative_prompt !== 'string') {
      return NextResponse.json(
        { error: 'Negative prompt must be a string' },
        { status: 400 }
      );
    }

    if (width && (typeof width !== 'number' || width <= 0)) {
      return NextResponse.json(
        { error: 'Width must be a positive number' },
        { status: 400 }
      );
    }

    if (height && (typeof height !== 'number' || height <= 0)) {
      return NextResponse.json(
        { error: 'Height must be a positive number' },
        { status: 400 }
      );
    }

    // 调用工具函数生成图像
    const imageUrl = await generateImageWithFlux({
      prompt,
      negative_prompt,
      width,
      height,
    });

    // 返回成功响应
    return NextResponse.json(
      { 
        success: true, 
        imageUrl 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error generating image:', error);

    // 处理不同类型的错误
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: error.message 
        },
        { status: 500 }
      );
    }

    // 处理未知错误
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
