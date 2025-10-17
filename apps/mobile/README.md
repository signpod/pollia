# Pollia Mobile 📱

Pollia 웹 서비스를 위한 Flutter 웹뷰 모바일 앱입니다.

## 주요 기능

- ✅ **완전한 웹뷰 통합**: Pollia 웹사이트를 네이티브 앱처럼 제공
- ✅ **Safe Area 지원**: iOS 노치, Android 제스처 영역 완벽 대응
- ✅ **Edge-to-Edge UI**: 전체 화면 활용
- ✅ **파일 업로드**: 카메라, 갤러리 접근 가능
- ✅ **JavaScript 통신**: 웹 ↔ 앱 양방향 통신 지원
- ✅ **뒤로가기 처리**: 웹 히스토리 자동 관리

## 시작하기

### 필수 요구사항

- Flutter 3.35.6 이상
- Dart 3.9.2 이상
- iOS: Xcode 15 이상, CocoaPods
- Android: Android Studio, JDK 11 이상

### 설치 및 실행

```bash
# 의존성 설치
cd apps/mobile
flutter pub get

# 디바이스 목록 확인
flutter devices

# iOS 시뮬레이터 실행
flutter run  # 자동으로 사용 가능한 디바이스 선택
# 또는 특정 시뮬레이터 지정
flutter run -d "iPhone 15"

# Android 에뮬레이터 실행
flutter run  # 자동 선택
# 또는
flutter run -d emulator-5554

# 특정 디바이스 ID로 실행
flutter run -d <device-id>
```

## 웹 URL 설정

기본적으로 `localhost:3000`으로 설정되어 있습니다.

**배포 시 URL 변경:**

`lib/screens/webview_screen.dart` 파일에서 수정:

```dart
// 개발 환경
final String initialUrl = 'http://localhost:3000';

// 배포 환경 (실제 도메인으로 변경)
final String initialUrl = 'https://pollia.com';
```

## 웹 ↔ 앱 통신

### Flutter → Web

웹페이지에서 JavaScript 실행:

```dart
webViewController?.evaluateJavascript(
  source: "alert('Hello from Flutter!')"
);
```

### Web → Flutter

웹에서 Flutter 함수 호출:

```javascript
// 웹 페이지에서
window.flutter.callHandler('flutterHandler', {
  action: 'someAction',
  data: { ... }
});
```

Flutter에서 핸들러 등록 (`webview_screen.dart`에 이미 구현됨):

```dart
controller.addJavaScriptHandler(
  handlerName: 'flutterHandler',
  callback: (args) {
    // args: 웹에서 전달한 데이터
    print('Received from web: $args');
    return {'result': 'success'};
  },
);
```

## 빌드 및 배포

### iOS 배포

```bash
# 빌드
flutter build ios --release

# Archive 생성 (Xcode에서)
open ios/Runner.xcworkspace
# Xcode에서 Product → Archive
```

**App Store 배포 전 체크리스트:**

- [ ] Bundle Identifier 설정 (Xcode)
- [ ] 팀 및 서명 인증서 설정
- [ ] 앱 아이콘 교체
- [ ] Info.plist의 권한 설명 문구 수정

### Android 배포

```bash
# APK 빌드 (테스트용)
flutter build apk --release

# App Bundle 빌드 (Play Store 업로드용)
flutter build appbundle --release
```

**Play Store 배포 전 체크리스트:**

- [ ] 키 서명 설정 (`android/app/build.gradle.kts`)
- [ ] `android/key.properties` 생성
- [ ] 앱 아이콘 교체
- [ ] `AndroidManifest.xml`의 권한 설명 확인

## 프로젝트 구조

```
mobile/
├── lib/
│   ├── main.dart              # 앱 진입점
│   └── screens/
│       └── webview_screen.dart # 웹뷰 화면
├── ios/                       # iOS 네이티브 설정
├── android/                   # Android 네이티브 설정
├── pubspec.yaml              # 의존성 관리
└── README.md
```

## 설정된 권한

### iOS (Info.plist)

- 인터넷 접근 (NSAppTransportSecurity)
- 카메라 접근 (NSCameraUsageDescription)
- 사진 라이브러리 (NSPhotoLibraryUsageDescription)
- 마이크 (NSMicrophoneUsageDescription)

### Android (AndroidManifest.xml)

- 인터넷 (INTERNET)
- 네트워크 상태 (ACCESS_NETWORK_STATE)
- 카메라 (CAMERA)
- 파일 읽기/쓰기 (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)
- 미디어 이미지 (READ_MEDIA_IMAGES)

## 개발 팁

### 로컬 웹 서버 연결

**iOS 시뮬레이터**: `http://localhost:3000` 사용 가능

**Android 에뮬레이터**:

```dart
// Android는 10.0.2.2를 사용해야 호스트의 localhost에 접근 가능
final String initialUrl = Platform.isAndroid
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';
```

### 디버깅

웹뷰 콘솔 로그는 Flutter 콘솔에 출력됩니다:

```dart
onConsoleMessage: (controller, consoleMessage) {
  print('WebView Console: ${consoleMessage.message}');
}
```

### Hot Reload

Flutter의 Hot Reload는 네이티브 코드에만 적용됩니다. 웹 콘텐츠 변경 사항은 웹뷰를 새로고침해야 합니다.

## 트러블슈팅

### iOS 빌드 에러

```bash
cd ios
pod install
cd ..
flutter clean
flutter pub get
```

### Android 빌드 에러

```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
```

### 웹뷰가 로드되지 않을 때

1. 인터넷 권한 확인
2. URL이 올바른지 확인
3. CORS 설정 확인 (웹 서버)
4. 콘솔 로그 확인

## 패키지 정보

- **flutter_inappwebview**: ^6.1.5 - 강력한 웹뷰 기능
- **url_launcher**: ^6.3.1 - 외부 링크 처리

## 라이선스

이 프로젝트는 Pollia 프로젝트의 일부입니다.

---

**개발자 문의**: Pollia Development Team
