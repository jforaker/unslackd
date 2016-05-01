'use strict';
var gulp = require('gulp-help')(require('gulp'));
var awspublish = require('gulp-awspublish');

gulp.task('s3', function () {

    // create a new publisher using S3 options
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#constructor-property
    var publisher = awspublish.create({
        region: 'us-east-1',
        params: {
            Bucket: process.env['AWS_BUCKET_NAME']
        },
        "accessKeyId": process.env['AWS_ACCESS_KEY_ID'],
        "secretAccessKey": process.env['AWS_SECRET_ACCESS_KEY']
    });

    // define custom headers
    var headers = {
        'Cache-Control': 'private, max-age=0, no-cache, no-store'
    };

    return gulp.src('./dist/**')
        // gzip, Set Content-Encoding headers and add .gz extension
        .pipe(awspublish.gzip())

        // publisher will add Content-Length, Content-Type and headers specified above
        // If not specified it will set x-amz-acl to public-read by default
        .pipe(publisher.publish(headers))

        // create a cache file to speed up consecutive uploads
        .pipe(publisher.cache())

        // print upload updates to console
        .pipe(awspublish.reporter());
});
