package io.github.timliiang.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.client.RestClient;

import java.time.Clock;
import java.time.Duration;

@Configuration
public class AppConfig {

    @Bean
    public BCryptPasswordEncoder bCryptPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Without timeouts a call to a hung upstream (TMDB) waits forever, and every request thread
    // stuck on it is one fewer for serving anyone else. Connect fails fast; reads get a bit longer.
    @Bean
    public RestClient.Builder restClientBuilder() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(3));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        return RestClient.builder().requestFactory(requestFactory);
    }

    // "Today" as a bean, so date-dependent code (the Now playing window) can be tested with a
    // fixed date instead of whatever day the tests happen to run. UTC: a server has no local day.
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

}
