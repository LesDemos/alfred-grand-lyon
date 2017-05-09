package insa.com.alfredGL.Adapter;

import android.content.Context;
import android.graphics.BitmapFactory;
import android.graphics.drawable.Drawable;
import android.util.Base64;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import java.io.InputStream;
import java.net.URL;

import insa.com.alfredGL.Pojo.CustomData;
import insa.com.alfredGL.R;

/** An array adapter that knows how to render views when given CustomData classes */
public class CustomArrayAdapter extends ArrayAdapter<CustomData> {
    private LayoutInflater mInflater;
    private ChatMessageAdapter mAdapter;

    public CustomArrayAdapter(Context context, CustomData[] values,ChatMessageAdapter Adapter) {
        super(context, R.layout.custom_data_view, values);
        mInflater = (LayoutInflater) getContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        mAdapter=Adapter;

    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        Holder holder;

        if (convertView == null) {

                // Inflate the view since it does not exist
                convertView = mInflater.inflate(R.layout.custom_data_view, parent, false);
                // Create and save off the holder in the tag so we get quick access to inner fields
                // This must be done for performance reasons
                holder = new Holder();
                holder.date = (TextView) convertView.findViewById(R.id.date);
                holder.time =  (TextView) convertView.findViewById(R.id.time) ;
                holder.hashtags = (TextView) convertView.findViewById(R.id.hashtags);
                holder.imageView= (ImageView) convertView.findViewById(R.id.imageView);
                convertView.setTag(holder);

                Button buttonLocalisation = (Button) convertView.findViewById(R.id.buttonLocalisation);
                ButtonOnClickListener buttonOnClickListener = new ButtonOnClickListener(mAdapter,"Localisation");
                buttonLocalisation.setOnClickListener(buttonOnClickListener);
                buttonOnClickListener.setCoordinates(getItem(position).getmCoordinates());
                buttonOnClickListener.setRequest_id(getItem(position).getRequestId());
                Button buttonValider = (Button) convertView.findViewById(R.id.buttonValider);
                ButtonOnClickListener buttonOnClickListenerValider = new ButtonOnClickListener(mAdapter,"Valider");
                buttonValider.setOnClickListener(buttonOnClickListenerValider);
                buttonOnClickListenerValider.setRequest_id(getItem(position).getRequestId());

        }else {
            holder = (Holder) convertView.getTag();
        }

        String[] partsDate = (getItem(position).getmDate()).split("T");
        String[] partsTime =  partsDate[1].split(":");
        holder.date.setText("Date: "+partsDate[0]);
        holder.time.setText("Heure: "+partsTime[0]+":"+partsTime[1]);
        holder.hashtags.setText(getItem(position).getmHashtags());
        String encodedDataString = getItem(position).getMpicId();
        encodedDataString = encodedDataString.replace("data:image/jpeg;base64,","");

        byte[] imageAsBytes = Base64.decode(encodedDataString.getBytes(), 0);
       holder.imageView.setImageBitmap(BitmapFactory.decodeByteArray(
                imageAsBytes, 0, imageAsBytes.length));
        //holder.imageView.setImageDrawable(LoadImageFromWebOperations(getItem(position).getMpicId()));
         return convertView;
    }

    /** View holder for the views we need access to */
    private static class Holder {
        public TextView date;
        public TextView time;
        public TextView hashtags;
        public ImageView imageView;

    }

    private Drawable LoadImageFromWebOperations(String url)
    {
        try
        {
            InputStream is = (InputStream) new URL(url).getContent();
            Drawable d = Drawable.createFromStream(is, "src name");
            return d;
        }catch (Exception e) {
            System.out.println("Exc="+e);
            return null;
        }
    }
}
