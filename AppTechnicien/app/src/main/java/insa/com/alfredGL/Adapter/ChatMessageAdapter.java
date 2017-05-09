package insa.com.alfredGL.Adapter;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.meetme.android.horizontallistview.HorizontalListView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

import insa.com.alfredGL.Pojo.ChatMessage;
import insa.com.alfredGL.Pojo.CustomData;
import insa.com.alfredGL.R;
import insa.com.alfredGL.Utility.BitmapHelper;
import insa.com.alfredGL.Utility.GetData;
import insa.com.alfredGL.Utility.ImageBase64;
import insa.com.alfredGL.Utility.SendData;

public class ChatMessageAdapter extends ArrayAdapter<ChatMessage> {

    private HorizontalListView mHlvCustomListWithDividerAndFadingEdge;
    private List<CustomData> mCustomData = new ArrayList<>();

    public ChatMessageAdapter(Context context, List<ChatMessage> data) {
        super(context, R.layout.item_mine_message, data);
    }


    @Override
    public int getViewTypeCount() {
        return 90;
    }

    @Override
    public int getItemViewType(int position) {
        ChatMessage item = getItem(position);
        return item.getType().ordinal();
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        int viewType = getItemViewType(position);
        TextView textView=null;

        switch (viewType) {
            case 0: //MessageType.MY_MESSAGE
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_mine_message, parent, false);
                textView = (TextView) convertView.findViewById(R.id.text);
                textView.setText(getItem(position).getContent());
                break;
            case 1: //MessageType.BOT_MESSAGE
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_bot_message, parent, false);
                textView = (TextView) convertView.findViewById(R.id.text);
                textView.setText(getItem(position).getContent());
                break;

            case 4: //MessageType.MENU_MESSAGE
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.custom_data_buttons_view, parent, false);
                Button buttonInterventions = (Button) convertView.findViewById(R.id.buttonInterventions);
                buttonInterventions.setOnClickListener(new ButtonOnClickListener(this,(String)buttonInterventions.getText()));
                Button buttonCarte = (Button) convertView.findViewById(R.id.buttonCarte);
                buttonCarte.setOnClickListener(new ButtonOnClickListener(this,(String)buttonCarte.getText()));
                break;
            case 5: //MessageType.SLIDER_MESSAGE
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.item_slider_message, parent, false);
                mHlvCustomListWithDividerAndFadingEdge = (HorizontalListView) convertView.findViewById(R.id.hlvCustomListWithDividerAndFadingEdge);
                setupCustomLists(convertView);
                break;
        }

        return convertView;
    }

    private void setupImage(View convertView, String args) {

        if(convertView !=null){

            String[] parts = args.split("///");
            String imagePath=parts[0];
            String request_id=parts[1];
            ImageView imageView = (ImageView) convertView.findViewById(R.id.taked_image);

            // Get the dimensions of the View
            int targetW = imageView.getWidth();
            int targetH = imageView.getHeight();

            // Get the dimensions of the bitmap
            BitmapFactory.Options bmOptions = new BitmapFactory.Options();
            bmOptions.inJustDecodeBounds = true;
            BitmapFactory.decodeFile(imagePath, bmOptions);



            // Decode the image file into a Bitmap sized to fill the View

            imageView.setImageBitmap(BitmapHelper.decodeFile(imagePath, 200, 200, true));

            Bitmap bitmap = ((BitmapDrawable)imageView.getDrawable()).getBitmap();
            String encoded = ImageBase64.encodeTobase64(bitmap);
            SendData.sendData(request_id,encoded);
        }
    }

    private void setupCustomLists(View convertView) {


        String data = GetData.getJSON();
        System.out.println(data);
        /*Type collectionType = new TypeToken<List<Report>>(){}.getType();
        List<Report> searchReport = (List<Report>) new Gson().fromJson(data, collectionType);*/
        try{
            JSONObject jsonObject = new JSONObject(data);
            JSONArray  reports = jsonObject.getJSONArray("features");
            for (int i=0; i<reports.length();i++){
                JSONObject report = reports.getJSONObject(i);
                String hashtagsText="";

                JSONObject properties = report.getJSONObject("properties");
                JSONArray hashtags = properties.getJSONArray("hashtags");
                for (int j=0; j< hashtags.length();j++){
                    String hashtag = hashtags.getString(j);
                    hashtagsText+=hashtag+" ";
                }

                String date=properties.getString("date");
                String image=properties.getString("image");
                String picId=properties.getString("request_id");
                JSONObject geometry = report.getJSONObject("geometry");
                JSONArray coordinates= geometry.getJSONArray("coordinates");
                List<Double> coor = new ArrayList<>();
                coor.add(Double.parseDouble(coordinates.getString(0)));
                coor.add(Double.parseDouble(coordinates.getString(1)));
                System.out.println("Date"+date+" coordin"+coor.get(0));


                CustomData cd = new CustomData(image,date,hashtagsText,coor,picId);
                mCustomData.add(cd);

            }
        }
        catch (JSONException e){
                System.out.println(e);
        }




        CustomData[] mCustomDataArray = mCustomData.toArray(new CustomData[mCustomData.size()]);
        // Make an array adapter using the built in android layout to render a list of strings
        CustomArrayAdapter adapter = new CustomArrayAdapter(getContext(), mCustomDataArray,this);

        // Assign adapter to HorizontalListView
        mHlvCustomListWithDividerAndFadingEdge.setAdapter(adapter);
    }

}

