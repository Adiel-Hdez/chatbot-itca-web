package com.example.demo.dto;

public class BotMessageResponse {

    private boolean success;
    private String reply;
    private Long matchedFaqId;
    private String matchType;

    public BotMessageResponse() {
    }

    public BotMessageResponse(boolean success, String reply, Long matchedFaqId, String matchType) {
        this.success = success;
        this.reply = reply;
        this.matchedFaqId = matchedFaqId;
        this.matchType = matchType;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public Long getMatchedFaqId() {
        return matchedFaqId;
    }

    public void setMatchedFaqId(Long matchedFaqId) {
        this.matchedFaqId = matchedFaqId;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }
}
