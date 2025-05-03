using AutoMapper;
using BookStore.DTOs.Book;
using BookStore.Entities;

namespace BookStore.Mapping;

public class BookStoreProfile : Profile {
    public BookStoreProfile() {
        CreateMap<Book, BookDto>();
        CreateMap<Book, BookDetailDto>();
        CreateMap<BookCreateDto, Book>();
    }
}
