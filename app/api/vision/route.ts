import { NextRequest, NextResponse } from 'next/server';
import { getServerState, updateServerState } from '@/lib/server-state';
import { Detection } from '@/lib/types';

export async function GET() {
  const state = getServerState();
  const isFresh = Date.now() - state.lastVisionTimestamp < 5000;
  
  return NextResponse.json({
    status: isFresh && state.backendConnected ? 'ONLINE' : 'OFFLINE',
    backendConnected: state.backendConnected,
    pipeline: 'PHONE_CAMERA -> IP_WEBCAM -> OPENCV -> YOLO11N',
    model: 'YOLO11n-seg/detect',
    allowedClasses: [
      'person',
      'bicycle',
      'car',
      'motorcycle',
      'bus',
      'truck',
      'chair',
      'bench',
      'suitcase',
    ],
    detections: state.detections,
    targetDetectionRule: 'Class "person" treated as rescue-target detection for prototype',
    timestamp: Date.now(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const detections: Detection[] = body.detections || [];
    
    // Automatically flag person as target
    const processedDetections = detections.map((det) => ({
      ...det,
      isTarget: det.class === 'person',
      timestamp: Date.now(),
    }));

    const hasTarget = processedDetections.some((d) => d.isTarget);

    updateServerState({
      detections: processedDetections,
      lastVisionTimestamp: Date.now(),
      backendConnected: true,
      ...(hasTarget ? { targetDetected: true } : {}),
    });

    return NextResponse.json({
      success: true,
      count: processedDetections.length,
      targetDetected: hasTarget,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}
