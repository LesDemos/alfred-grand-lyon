package insa.com.alfredGL.Adapter;

import android.content.Context;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.GridView;

/**
 * Created by user on 16/01/2017.
 */

public class ButtonAdapter extends BaseAdapter {

    private Context mContext;
    private ChatMessageAdapter mAdapter;
    private String[] buttonNames;

    // Gets the context so it can be used later
    public ButtonAdapter(Context c, ChatMessageAdapter mAdapter) {
        this.mContext = c;
        this.mAdapter=mAdapter;

    }

    // Total number of things contained within the adapter
    public int getCount() {
        return buttonNames.length;
    }

    // Require for structure, not really used in my code.
    public Object getItem(int position) {
        return null;
    }

    // Require for structure, not really used in my code. Can
    // be used to get the id of an item in the adapter for
    // manual control.
    public long getItemId(int position) {
        return position;
    }

    public View getView(int position,
                        View convertView, ViewGroup parent) {
        Button btn;
        if (convertView == null) {
            // if it's not recycled, initialize some attributes
            btn = new Button(mContext);
            btn.setLayoutParams(new GridView.LayoutParams(GridView.LayoutParams.MATCH_PARENT,GridView.LayoutParams.WRAP_CONTENT));
            btn.setPadding(8, 8, 8, 8);

        }
        else {
            btn = (Button) convertView;

        }

        btn.setOnClickListener(new ButtonOnClickListener(mAdapter,buttonNames[position]));
        btn.setText(buttonNames[position]);
        btn.setTextColor(Color.WHITE);
        btn.setBackgroundColor(Color.parseColor("#757575"));
        btn.setId(position);

        return btn;
    }

    public String[] getButtonNames() {
        return buttonNames;
    }

    public void setButtonNames(String[] buttonNames) {
        this.buttonNames = buttonNames;
    }
}

