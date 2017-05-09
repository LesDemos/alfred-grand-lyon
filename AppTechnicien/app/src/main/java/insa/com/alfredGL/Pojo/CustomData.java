package insa.com.alfredGL.Pojo;

import java.util.List;

/** This is just a simple class for holding data that is used to render our custom view */
public class CustomData {


    private String mpicUrl;
    private String mDate;
    private String mHashtags;
    private List<Double> mCoordinates;
    private String requestId;

    public CustomData(String mpicUrl, String mDate, String mHashtags, List<Double> mCoordinates, String requestId) {
        this.mpicUrl = mpicUrl;
        this.mDate= mDate;
        this.mHashtags = mHashtags;
        this.mCoordinates=mCoordinates;
        this.requestId=requestId;

    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getMpicId() {
        return mpicUrl;
    }

    public void setMpicId(String mpicUrl) {
        this.mpicUrl = mpicUrl;
    }

    public String getmDate() {
        return mDate;
    }

    public void setmDate(String mDate) {
        this.mDate = mDate;
    }

    public String getmHashtags() {
        return mHashtags;
    }

    public void setmHashtags(String mHashtags) {
        this.mHashtags = mHashtags;
    }

    public String getMpicUrl() {
        return mpicUrl;
    }

    public void setMpicUrl(String mpicUrl) {
        this.mpicUrl = mpicUrl;
    }

    public List<Double> getmCoordinates() {
        return mCoordinates;
    }

    public void setmCoordinates(List<Double> mCoordinates) {
        this.mCoordinates = mCoordinates;
    }

}
