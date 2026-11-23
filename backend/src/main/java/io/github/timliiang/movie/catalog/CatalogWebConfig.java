package io.github.timliiang.movie.catalog;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Lets controllers take CatalogList/CatalogSort straight from ?list=now_playing. Spring's built-in
// enum conversion only matches the constant name (NOW_PLAYING), not the URL spelling. A value that
// fails to convert surfaces as a TypeMismatchException, which GlobalExceptionHandler answers with 400.
@Configuration
public class CatalogWebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, CatalogList.class, CatalogList::fromParam);
        registry.addConverter(String.class, CatalogSort.class, CatalogSort::fromParam);
    }
}
