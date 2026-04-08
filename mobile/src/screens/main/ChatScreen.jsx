import React, { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform,
    Image
} from 'react-native';
import { Send, Mic, Info, Globe } from 'lucide-react-native';

const ChatScreen = () => {
    const [messages, setMessages] = useState([
        { id: '1', text: "Hello! I G-Assist, your clinical companion. I can help interpret interaction reports or answer pharmacological questions. What's on your mind?", sender: 'ai', time: '10:00 AM' }
    ]);
    const [input, setInput] = useState('');
    const [lang, setLang] = useState('en');
    const flatListRef = useRef();

    const handleSend = () => {
        if (!input.trim()) return;
        
        const newMessage = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setInput('');

        // Mock AI response
        setTimeout(() => {
            const aiRes = {
                id: (Date.now() + 1).toString(),
                text: "Analytical processed. In clinical terms, that molecule interacts primarily via the CYP3A4 pathway.",
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiRes]);
        }, 1000);
    };

    const LangBtn = ({ code, active }) => (
        <TouchableOpacity 
            onPress={() => setLang(code)}
            style={[styles.langBtn, active && styles.langBtnActive]}
        >
            <Text style={[styles.langText, active && styles.langTextActive]}>{code.toUpperCase()}</Text>
        </TouchableOpacity>
    );

    const MessageBubble = ({ item }) => (
        <View style={[styles.bubbleWrapper, item.sender === 'user' ? styles.bubbleRight : styles.bubbleLeft]}>
            {item.sender === 'ai' && (
                <View style={styles.aiAvatar}>
                    <Activity size={12} color="#fff" />
                </View>
            )}
            <View style={[styles.bubble, item.sender === 'user' ? styles.bubbleUser : styles.bubbleAi]}>
                <Text style={[styles.bubbleText, item.sender === 'user' && styles.textWhite]}>
                    {item.text}
                </Text>
                <Text style={[styles.timeText, item.sender === 'user' && styles.textWhiteMuted]}>
                    {item.time}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header / Language */}
            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <View style={styles.statusDot} />
                    <Text style={styles.headerTitle}>Medical Assistant</Text>
                </View>
                <View style={styles.langSelector}>
                    <LangBtn code="en" active={lang === 'en'} />
                    <LangBtn code="hi" active={lang === 'hi'} />
                    <LangBtn code="gu" active={lang === 'gu'} />
                </View>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={({ item }) => <MessageBubble item={item} />}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => flatListRef.current.scrollToEnd()}
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
                style={styles.inputContainer}
            >
                <TouchableOpacity style={styles.micBtn}>
                    <Mic size={20} color="#64748b" />
                </TouchableOpacity>
                <TextInput
                    style={styles.input}
                    placeholder="Ask about drugs, dosage..."
                    placeholderTextColor="#94a3b8"
                    value={input}
                    onChangeText={setInput}
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!input.trim()}
                >
                    <Send size={20} color="#fff" />
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    header: { 
        paddingTop: 50, 
        paddingHorizontal: 20, 
        paddingBottom: 20, 
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
    headerTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a' },
    langSelector: { flexDirection: 'row', gap: 6 },
    langBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    langBtnActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
    langText: { fontSize: 10, fontWeight: '900', color: '#64748b' },
    langTextActive: { color: '#fff' },
    listContent: { padding: 20 },
    bubbleWrapper: { marginBottom: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
    bubbleLeft: { alignSelf: 'flex-start' },
    bubbleRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
    aiAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' },
    bubble: { maxWidth: '80%', padding: 16, borderRadius: 24 },
    bubbleAi: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
    bubbleUser: { backgroundColor: '#1e293b', borderBottomRightRadius: 4 },
    bubbleText: { fontSize: 15, fontWeight: 'bold', color: '#1e293b', lineHeight: 22 },
    textWhite: { color: '#fff' },
    timeText: { fontSize: 9, color: '#94a3b8', marginTop: 6, fontWeight: 'bold', textAlign: 'right' },
    textWhiteMuted: { color: 'rgba(255,255,255,0.5)' },
    inputContainer: { 
        padding: 16, 
        paddingBottom: Platform.OS === 'ios' ? 32 : 16, 
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0'
    },
    input: { flex: 1, minHeight: 48, maxHeight: 100, backgroundColor: '#f8fafc', borderRadius: 24, paddingHorizontal: 20, fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    micBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', shadowColor: '#6366f1', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    sendBtnDisabled: { backgroundColor: '#cbd5e1', shadowOpacity: 0 }
});

export default ChatScreen;
