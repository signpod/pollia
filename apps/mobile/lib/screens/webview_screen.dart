import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  InAppWebViewController? webViewController;
  double progress = 0;
  bool isLoading = true;
  
  // TODO: 웹 URL - 배포 후 실제 도메인으로 변경하세요
  final String initialUrl = 'http://localhost:3000';

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        backgroundColor: Colors.white,
        body: SafeArea(
          // SafeArea를 사용하여 notch/gesture 영역 자동 처리
          child: Stack(
            children: [
              InAppWebView(
                initialSettings: InAppWebViewSettings(
                  // 기본 설정
                  useShouldOverrideUrlLoading: true,
                  mediaPlaybackRequiresUserGesture: false,
                  allowsInlineMediaPlayback: true,
                  
                  // JavaScript 활성화
                  javaScriptEnabled: true,
                  javaScriptCanOpenWindowsAutomatically: true,
                  
                  // 파일 업로드 지원
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                  
                  // 캐시 설정
                  cacheEnabled: true,
                  clearCache: false,
                  
                  // Safe Area 관련 설정
                  transparentBackground: false,
                  
                  // 줌 비활성화 (모바일 앱처럼)
                  supportZoom: false,
                  builtInZoomControls: false,
                  displayZoomControls: false,
                  
                  // User Agent 설정 (서버에서 모바일 앱 감지 가능)
                  userAgent: 'PolliaApp/1.0 (Flutter)',
                ),
                initialUrlRequest: URLRequest(
                  url: WebUri(initialUrl),
                ),
                onWebViewCreated: (controller) {
                  webViewController = controller;
                  
                  // JavaScript Handler 등록 (웹 ↔ 앱 통신)
                  controller.addJavaScriptHandler(
                    handlerName: 'flutterHandler',
                    callback: (args) {
                      // 웹에서 window.flutter.callHandler('flutterHandler', data) 로 호출 가능
                      return {'result': 'success'};
                    },
                  );
                },
                onLoadStart: (controller, url) {
                  setState(() {
                    isLoading = true;
                  });
                },
                onLoadStop: (controller, url) async {
                  setState(() {
                    isLoading = false;
                  });
                },
                onProgressChanged: (controller, progress) {
                  setState(() {
                    this.progress = progress / 100;
                  });
                },
                onConsoleMessage: (controller, consoleMessage) {
                  // 웹 콘솔 로그를 Flutter 콘솔에 출력 (디버그 모드에서만)
                  debugPrint('WebView Console: ${consoleMessage.message}');
                },
                shouldOverrideUrlLoading: (controller, navigationAction) async {
                  // 외부 링크 처리 (필요시)
                  // final uri = navigationAction.request.url;
                  // if (uri?.scheme == 'tel' || uri?.scheme == 'mailto') {
                  //   await launchUrl(uri!);
                  //   return NavigationActionPolicy.CANCEL;
                  // }
                  
                  return NavigationActionPolicy.ALLOW;
                },
                onReceivedError: (controller, request, error) {
                  // 에러 처리 (디버그 모드에서만)
                  debugPrint('WebView Error: ${error.description}');
                },
              ),
              
              // 로딩 인디케이터
              if (isLoading)
                Container(
                  color: Colors.white,
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          color: Color(0xFF8D5DF9),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Pollia',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF8D5DF9),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              
              // 상단 로딩 프로그레스 바
              if (progress < 1.0 && !isLoading)
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.transparent,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      Color(0xFF8D5DF9),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  // 뒤로가기 처리
  Future<bool> _onWillPop() async {
    if (webViewController != null) {
      final canGoBack = await webViewController!.canGoBack();
      if (canGoBack) {
        webViewController!.goBack();
        return false;
      }
    }
    return true;
  }
}

