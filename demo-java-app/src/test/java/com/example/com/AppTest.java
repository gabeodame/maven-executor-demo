package com.example.com;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Unit test for simple App.
 */
public class AppTest
        extends TestCase {
    /**
     * Create the test case
     *
     * @param testName name of the test case
     */
    public AppTest(String testName) {
        super(testName);
    }

    /**
     * @return the suite of tests being tested
     */
    public static Test suite() {
        return new TestSuite(AppTest.class);
    }

    /**
     * Rigourous Test :-)
     */
    public void testadd1() {
        assertTrue(30 == App.add(15, 15));

    }

    public void testadd2() {
        assertTrue(30 == App.add(10, 20));
        assertFalse(10 == App.add(20, 10));
    }

    public void testadd3() {

        assertFalse(10 == App.add(20, 10));
    }

}
