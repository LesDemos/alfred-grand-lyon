package insa.com.alfredGL.Utility;

import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Created by user on 03/05/2017.
 */

public class SearchReport {

    @SerializedName("features")
    public List<Report> reports;

    public List<Report> getReports() {
        return reports;
    }

    public void setReports(List<Report> reports) {
        this.reports = reports;
    }

}
