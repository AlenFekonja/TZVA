package com.vaja1.test;

import androidx.test.espresso.web.model.Evaluation;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.ext.junit.rules.ActivityScenarioRule;
import androidx.test.rule.GrantPermissionRule;

import com.vaja1.MainActivity;

import org.hamcrest.Matchers;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.swipeLeft;
import static androidx.test.espresso.action.ViewActions.swipeRight;
import static androidx.test.espresso.action.ViewActions.actionWithAssertions;
import static androidx.test.espresso.matcher.ViewMatchers.withContentDescription;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withTagValue;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;


import androidx.test.espresso.action.GeneralSwipeAction;
import androidx.test.espresso.action.Swipe;
import androidx.test.espresso.action.Press;
import androidx.test.espresso.action.CoordinatesProvider;

import android.view.View;

import org.hamcrest.Matcher;

import static org.hamcrest.Matchers.is;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.matcher.ViewMatchers.isRoot;

import androidx.test.espresso.ViewAction;
import androidx.test.espresso.UiController;
import androidx.test.espresso.action.ViewActions;

import android.view.View;
import android.webkit.WebView;

import static androidx.test.espresso.action.ViewActions.scrollTo;
import static androidx.test.espresso.web.model.Atoms.script;
import static androidx.test.espresso.web.sugar.Web.onWebView;
import static org.junit.Assert.assertTrue;

import java.util.UUID;

import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static androidx.test.espresso.action.ViewActions.swipeUp;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.allOf;
import static androidx.test.espresso.matcher.ViewMatchers.isDescendantOfA;

@RunWith(AndroidJUnit4.class)
public class E2eTest {

    @Rule
    public ActivityScenarioRule<MainActivity> activityRule =
            new ActivityScenarioRule<>(MainActivity.class);

    @Rule
    public GrantPermissionRule permissionRule = GrantPermissionRule.grant(
            android.Manifest.permission.ACCESS_FINE_LOCATION,
            android.Manifest.permission.ACCESS_COARSE_LOCATION,
            android.Manifest.permission.ACCESS_BACKGROUND_LOCATION,
            android.Manifest.permission.CAMERA,
            android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE
    );

    @Test
    public void LoginTest() throws InterruptedException {
        Thread.sleep(15000);
        onView(withTagValue(Matchers.is((Object) "email")))
                .perform(replaceText("alen2@gmail.com"), closeSoftKeyboard());
        Thread.sleep(1000);
        onView(withTagValue(Matchers.is((Object) "password")))
                .perform(replaceText("alen123"), closeSoftKeyboard());
        Thread.sleep(1000);
        onView(withTagValue(Matchers.is((Object) "loginButton")))
                .perform(click());
        Thread.sleep(5000);
        onView(withTagValue(Matchers.is((Object) "mapScreenView")))
                .check(matches(isDisplayed()));
    }

    @Test
    public void MapTest() throws Exception {

        Thread.sleep(15000);
        onView(withTagValue(Matchers.is((Object) "email")))
                .perform(replaceText("alen@gmail.com"), closeSoftKeyboard());
        Thread.sleep(1000);
        onView(withTagValue(Matchers.is((Object) "password")))
                .perform(replaceText("alen123"), closeSoftKeyboard());
        Thread.sleep(1000);
        onView(withTagValue(Matchers.is((Object) "loginButton")))
                .perform(click());
        Thread.sleep(10000);
        onView(withTagValue(Matchers.is((Object) "mapScreenView")))
                .check(matches(isDisplayed()));

        Thread.sleep(15000);

        onWebView().forceJavascriptEnabled();

        Thread.sleep(2000);


        float[] prevCenter = getMapCenter();
        onWebView().perform(script("map.panBy([200, 0]);"));
        Thread.sleep(1000);
        float[] newCenter = getMapCenter();
        assertTrue("Pan right failed", newCenter[1] > prevCenter[1]);

        prevCenter = newCenter;
        onWebView().perform(script("map.panBy([-200, 0]);"));
        Thread.sleep(1000);
        newCenter = getMapCenter();
        assertTrue("Pan left failed", newCenter[1] < prevCenter[1]);

        prevCenter = newCenter;
        onWebView().perform(script("map.panBy([0, -200]);"));
        Thread.sleep(1000);
        newCenter = getMapCenter();
        assertTrue("Pan up failed", newCenter[0] > prevCenter[0]);


        prevCenter = newCenter;
        onWebView().perform(script("map.panBy([0, 200]);"));
        Thread.sleep(1000);
        newCenter = getMapCenter();
        assertTrue("Pan down failed", newCenter[0] < prevCenter[0]);


        int prevZoom = getMapZoom();
        onWebView().perform(script("map.zoomIn();"));
        Thread.sleep(1000);
        int newZoom = getMapZoom();
        assertTrue("Zoom in failed", newZoom > prevZoom);

        prevZoom = newZoom;
        onWebView().perform(script("map.zoomOut();"));
        Thread.sleep(1000);
        newZoom = getMapZoom();
        assertTrue("Zoom out failed", newZoom < prevZoom);

    }

    @Test
    public void AddPinTest() throws InterruptedException {

        Thread.sleep(15000);
        onView(withTagValue(Matchers.is((Object) "email")))
                .perform(replaceText("alen@gmail.com"), closeSoftKeyboard());

        onView(withTagValue(Matchers.is((Object) "password")))
                .perform(replaceText("alen123"), closeSoftKeyboard());

        onView(withTagValue(Matchers.is((Object) "loginButton")))
                .perform(click());

        Thread.sleep(2000);
        onView(withContentDescription("addPinTab")).perform(click());


        Thread.sleep(2000);
        onView(withTagValue(Matchers.is((Object) "addPinScreenView")))
                .check(matches(isDisplayed()));

        onView(withTagValue(Matchers.is((Object) "city")))
                .perform(replaceText("Maribor"), closeSoftKeyboard());

        onView(withTagValue(Matchers.is((Object) "street")))
                .perform(replaceText("Smetanova ulica 7"), closeSoftKeyboard());

        String randomId = UUID.randomUUID().toString();

        onView(withTagValue(Matchers.is((Object) "title")))
                .perform(replaceText("Prometna nesreca: " + randomId), closeSoftKeyboard());

        onView(withTagValue(Matchers.is((Object) "description")))
                .perform(replaceText("Zaletelo se je 10 avtomobilov. Vsi čakajo, da se polomljeni avti odmaknejo"), closeSoftKeyboard());

        Thread.sleep(2000);

        onView(withTagValue(Matchers.is((Object) "save")))
                .perform(scrollTo());

        Thread.sleep(1000);

        onView(withTagValue(Matchers.is((Object) "save")))
                .perform(click());
        Thread.sleep(5000);

        onView(withContentDescription("pinListTab")).perform(click());
        Thread.sleep(2000);
        onView(withTagValue(is((Object) "pinList")))
                .perform(ViewActions.swipeUp());

        Thread.sleep(2000);

        onView(withTagValue(Matchers.is((Object) "search")))
                .perform(replaceText("Prometna nesreca: " + randomId), closeSoftKeyboard());
        Thread.sleep(5000);
        onView(allOf(
                withText(containsString("Prometna nesreca: " + randomId.substring(0, 3))),
                isDescendantOfA(withTagValue(Matchers.is((Object) "pinList")))
        )).check(matches(isDisplayed()));


    }


    float[] getMapCenter() throws Exception {
        final float[] center = new float[2];

        Evaluation latEval = onWebView()
                .perform(script("return map.getCenter().lat;"))
                .get();

        Evaluation lngEval = onWebView()
                .perform(script("return map.getCenter().lng;"))
                .get();

        center[0] = ((Number) latEval.getValue()).floatValue();
        center[1] = ((Number) lngEval.getValue()).floatValue();

        return center;
    }


    int getMapZoom() throws Exception {
        Evaluation zoomEval = onWebView()
                .perform(script("return map.getZoom();"))
                .get();
        return ((Number) zoomEval.getValue()).intValue();
    }


}