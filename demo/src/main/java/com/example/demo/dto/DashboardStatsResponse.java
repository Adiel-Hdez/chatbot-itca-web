package com.example.demo.dto;

import java.util.List;

public class DashboardStatsResponse {

    private long totalFaqs;
    private long activeFaqs;
    private long totalCategories;
    private long totalMessagesHandled;
    private List<String> categories;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalFaqs, long activeFaqs, long totalCategories, long totalMessagesHandled, List<String> categories) {
        this.totalFaqs = totalFaqs;
        this.activeFaqs = activeFaqs;
        this.totalCategories = totalCategories;
        this.totalMessagesHandled = totalMessagesHandled;
        this.categories = categories;
    }

    public long getTotalFaqs() {
        return totalFaqs;
    }

    public void setTotalFaqs(long totalFaqs) {
        this.totalFaqs = totalFaqs;
    }

    public long getActiveFaqs() {
        return activeFaqs;
    }

    public void setActiveFaqs(long activeFaqs) {
        this.activeFaqs = activeFaqs;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getTotalMessagesHandled() {
        return totalMessagesHandled;
    }

    public void setTotalMessagesHandled(long totalMessagesHandled) {
        this.totalMessagesHandled = totalMessagesHandled;
    }

    public List<String> getCategories() {
        return categories;
    }

    public void setCategories(List<String> categories) {
        this.categories = categories;
    }
}
