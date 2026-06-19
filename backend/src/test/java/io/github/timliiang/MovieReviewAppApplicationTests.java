package io.github.timliiang;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import javax.sql.DataSource;

@SpringBootTest
class MovieReviewAppApplicationTests {

	@Autowired
	private DataSource dataSource;

	@Test
	void contextLoads() throws Exception {
		System.out.println(">>> DataSource URL: " + dataSource.getConnection().getMetaData().getURL());
	}

}
