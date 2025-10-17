// This is a basic Flutter widget test.

import 'package:flutter_test/flutter_test.dart';

import 'package:pollia_mobile/main.dart';

void main() {
  testWidgets('PolliaApp smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const PolliaApp());

    // Verify that the app title is Pollia
    expect(find.text('Pollia'), findsOneWidget);
  });
}
