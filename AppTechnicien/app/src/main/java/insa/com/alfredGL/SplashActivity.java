package insa.com.alfredGL;

import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.animation.AlphaAnimation;
import android.widget.ImageView;
import android.widget.TextView;

import com.pnikosis.materialishprogress.ProgressWheel;

public class SplashActivity extends AppCompatActivity {
    private final SplashActivity activity = this;

    ProgressWheel progressWheel;
    TextView textView;
    ImageView logoImage;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        progressWheel = (ProgressWheel) findViewById(R.id.progress_wheel);
        logoImage = (ImageView) findViewById(R.id.logo_image);

        this.fadeInViews();
        AsyncTask<Void, Void, Void> task = new AsyncTask<Void, Void, Void>() {
        @Override
        protected Void doInBackground(Void... params) {
            try {
                Thread.sleep(5000);
            } catch (InterruptedException e) {
                // pass
            }
            return null;
        }

        @Override
        protected void onPostExecute(Void result) {
            startActivity(new Intent(activity, LoginActivity.class));
            activity.finish();
        }
    };
    task.execute((Void[])null);
}

    private void fadeInViews() {
        int duration = 2500;

        AlphaAnimation fadeIn = new AlphaAnimation(0.0f , 1.0f);
        fadeIn.setDuration(duration);
        fadeIn.setFillAfter(true);
        progressWheel.startAnimation(fadeIn);
        logoImage.startAnimation(fadeIn);
    }
}