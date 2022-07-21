# Rust Fundamentals Udemy Course Day 1
June 3, 2022
[Running gRPC Rust](https://apievangelist.com/2011/03/31/api-metrics-and-analytics/)
[Rust Fundamentals](https://www.udemy.com/course/ultimate-rust-crash-course/learn/lecture/17894460#overview) **[Udemy Course](https://www.udemy.com/course/ultimate-rust-crash-course/learn/lecture/17894460#overview)**
 
 
[rust - variables](evernote:///view/133968271/s704/73a1d2bc-1aea-b50f-839d-9c694b555cf4/e17f9fd6-45f9-1d01-0509-7b44fb92571d/)
## **~Day 1~**

 
 
~Cargo is~ the test runner, the make file, and the documentation generator

Create a new Rust program
`cargo new hello`
Move into the directory of new program
`cd hello/`
Run the program (Rust automatically runs in debug mode. Default output directory is src/)
`cargo run`
Run the program in production mode
`cargo run -r`
Create a library (Source: [mod and the filesystem - Rust book 1st edition](evernote:///view/133968271/s704/68bc87dd-c42e-4ffa-a8c4-f5e990f21006/2fb98242-8324-14e4-155c-be837bdbe1e9/) )
`cargo new communicator --lib`

Variable shadowing
Variable shadowing with different types

Immutable to mutable

Memory safety

garbage collection immediately after block scope

### **~Day 2~**

 
 
[Modules in Rust](https://doc.rust-lang.org/1.30.0/book/second-edition/ch07-01-mod-and-the-filesystem.html) (highlights)
* [rust - Modules: 1st Edition Book!: - The Rust Programming Language](evernote:///view/133968271/s704/82cc05ce-ffcc-42a0-8d3e-3ff70260bcdd/2fb98242-8324-14e4-155c-be837bdbe1e9/)
 [Cargo.toml vs .lock - cargo update command](https://doc.rust-lang.org/cargo/guide/cargo-toml-vs-cargo-lock.html)
* Use specific versions and SHAs for dependencies
 [cargo rustdoc - The Cargo Book](evernote:///view/133968271/s704/880fe5e3-853d-4703-b8ec-6eedbe8bf3e4/2fb98242-8324-14e4-155c-be837bdbe1e9/)
* Generate documentation using rustdoc!

### Create a library!

Create a library using the `--lib` flag with `cargo new` 
`cargo new communicator --lib` 

[image:720018C8-7A09-4A35-B55B-98999AC2A4F0-5482-0000001DBF20E70D/Screen Shot 2022-06-05 at 12.35.27 PM.png]

#dev/rust #evernote
 
 

 
 