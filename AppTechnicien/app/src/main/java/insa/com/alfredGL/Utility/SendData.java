package insa.com.alfredGL.Utility;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.stream.JsonWriter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Created by user on 04/05/2017.
 */

public class SendData {

    public static String sendData(String request_id, String encoded){

        final StringWriter sw = new StringWriter();
        JsonWriter writer;
        try {
            writer = new JsonWriter(sw);
            writer.beginObject();
            writer.name("request_id").value(request_id);
            writer.name("image_final").value(encoded);
            writer.endObject();
            writer.close();
        } catch (final IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        final JsonObject obj = new JsonParser().parse(sw.toString()).getAsJsonObject();
        final String urlpath = "https://alfred-grand-lyon.herokuapp.com/api/reports/state";
        HttpURLConnection connection = null;
        try {
            final URL url = new URL(urlpath);
            connection = (HttpURLConnection) url.openConnection();
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setRequestMethod("POST");
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setRequestProperty("Accept", "application/json");
            final OutputStreamWriter streamWriter = new OutputStreamWriter(connection.getOutputStream());
            streamWriter.write(obj.toString());
            streamWriter.flush();
            final StringBuilder stringBuilder = new StringBuilder();
            if (connection.getResponseCode() == HttpURLConnection.HTTP_OK) {
                final InputStreamReader streamReader = new InputStreamReader(connection.getInputStream());
                final BufferedReader bufferedReader = new BufferedReader(streamReader);
                String response = null;
                while ((response = bufferedReader.readLine()) != null) {
                    stringBuilder.append(response + "\n");
                }
                bufferedReader.close();

                //Log.d("test", stringBuilder.toString());
                return stringBuilder.toString();
            } else {
                // Log.e("test", connection.getResponseMessage());
                return null;
            }
        } catch (final Exception exception) {
            // Log.e("test", exception.toString());
            return null;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }


    }
}
