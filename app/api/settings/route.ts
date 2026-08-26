import { NextResponse } from 'next/server';
import { getSettings, saveAllSettings, resetSettingToDefault, SettingsMap } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await saveAllSettings(body);
    const updated = await getSettings();
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to save settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { key } = await request.json();
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }
    const defaultValue = await resetSettingToDefault(key as keyof SettingsMap);
    return NextResponse.json({ key, value: defaultValue });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to reset setting' }, { status: 500 });
  }
}
