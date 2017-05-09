package insa.com.alfredGL.Pojo;

public class ChatMessage {

    private MessageType type;
    private String content;

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public ChatMessage(String message, MessageType mType) {
        content = message;
        type = mType;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}