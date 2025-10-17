import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/webview_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Status bar를 투명하게 설정 (Safe Area 활용)
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );
  
  // Edge-to-edge 모드 활성화
  SystemChrome.setEnabledSystemUIMode(
    SystemUiMode.edgeToEdge,
  );
  
  runApp(const PolliaApp());
}

class PolliaApp extends StatelessWidget {
  const PolliaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pollia',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF8D5DF9), // Violet-500
        ),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}
