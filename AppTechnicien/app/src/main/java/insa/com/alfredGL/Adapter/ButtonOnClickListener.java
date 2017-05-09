package insa.com.alfredGL.Adapter;

import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;

import java.util.List;

import insa.com.alfredGL.ChatActivity;
import insa.com.alfredGL.MapsActivity;
import insa.com.alfredGL.Pojo.ChatMessage;
import insa.com.alfredGL.Pojo.MessageType;
import insa.com.alfredGL.R;
import insa.com.alfredGL.TakePicFragment;

public class ButtonOnClickListener implements View.OnClickListener {

    private final String buttonText;
    private ChatMessageAdapter mAdapter ;
    private List<Double> coordinates;
    private String request_id;

    public ButtonOnClickListener(ChatMessageAdapter mAdapter, String buttonText)
    {
        this.buttonText = buttonText;
        this.mAdapter = mAdapter;
    }

    public ButtonOnClickListener(ChatMessageAdapter mAdapter, String buttonText, List<Double> coordinates, String request_id)
    {

        this.buttonText = buttonText;
        this.mAdapter = mAdapter;
        this.coordinates=coordinates;
        this.request_id=request_id;
    }

    public List<Double> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<Double> coordinates) {
        this.coordinates = coordinates;
    }

    public String getRequest_id() {
        return request_id;
    }

    public void setRequest_id(String request_id) {
        this.request_id = request_id;
    }

    @Override
    public void onClick(View v)
    {

        mimicOtherMessage(buttonText, MessageType.MY_MESSAGE);
        switch(buttonText){

            case "Mes Interventions":
                mimicOtherMessage("",MessageType.SLIDER_MESSAGE);
                break;
            case "Localisation":
                Intent i = new Intent(mAdapter.getContext(),MapsActivity.class);
                Bundle extras = new Bundle();
                double lat = this.getCoordinates().get(1);
                double lng = this.getCoordinates().get(0);
                extras.putDouble("lat", lat);
                extras.putDouble("lng", lng);
                i.putExtras(extras);
                mAdapter.getContext().startActivity(i);
                break;

            case "Carte":
                String url = "https://alfred-grand-lyon.herokuapp.com/api/map";
                try {
                    Intent iCarte = new Intent("android.intent.action.MAIN");
                    iCarte.setComponent(ComponentName.unflattenFromString("com.android.chrome/com.android.chrome.Main"));
                    iCarte.addCategory("android.intent.category.LAUNCHER");
                    iCarte.setData(Uri.parse(url));
                    mAdapter.getContext().startActivity(iCarte);
                }
                catch(ActivityNotFoundException e) {
                    // Chrome is not installed
                    Intent iCarte = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    mAdapter.getContext().startActivity(iCarte);
                }

                break;
            case "Valider":
                mimicOtherMessage("Veuillez prendre une photo", MessageType.BOT_MESSAGE);
                Fragment fr = new TakePicFragment();
                Bundle bundle = new Bundle();
                bundle.putString("request_id",request_id);
                fr.setArguments(bundle);
                FragmentManager fm = ((Activity)mAdapter.getContext()).getFragmentManager();
                FragmentTransaction fragmentTransaction = fm.beginTransaction();
                fragmentTransaction.replace(R.id.fragment_container, fr);
                fragmentTransaction.commit();
                break;
        }
    }

    private void mimicOtherMessage(String message, MessageType type) {
        ChatMessage chatMessage = new ChatMessage(message, type);
        ChatActivity activity = (ChatActivity) mAdapter.getContext();
        activity.updateChat();
        mAdapter.add(chatMessage);
    }



}
