package insa.com.alfredGL.Utility;

import com.google.gson.annotations.SerializedName;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by user on 03/05/2017.
 */

public class Report {

    @SerializedName("date")
    private String date;

    @SerializedName("hashtags")
    private List<String> hashtags = new ArrayList<String>();

    @SerializedName("coordinates")
    private List<Integer> coordinates=new ArrayList<Integer>();

    @SerializedName("image")
    private String imageUrl;

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }



    public List<Integer> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<Integer> coordinates) {
        this.coordinates = coordinates;
    }

    public String getDate() {

        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public List<String> getHashtags() {
        return hashtags;
    }

    public void setHashtags(List<String> hashtags) {
        this.hashtags = hashtags;
    }

    @Override
    public String toString() {
        return "Report{" +
                "date='" + date + '\'' +
                ", hashtags=" + hashtags +
                ", coordinates=" + coordinates +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}
