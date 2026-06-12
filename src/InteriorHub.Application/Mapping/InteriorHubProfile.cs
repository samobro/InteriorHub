using AutoMapper;
using InteriorHub.Application.DTOs.Categories;
using InteriorHub.Application.DTOs.ContactRequests;
using InteriorHub.Application.DTOs.Engineers;
using InteriorHub.Application.DTOs.Projects;
using InteriorHub.Domain.Entities;

namespace InteriorHub.Application.Mapping;

public sealed class InteriorHubProfile : Profile
{
    public InteriorHubProfile()
    {
        CreateMap<Category, CategoryReadDto>();
        CreateMap<CategoryCreateDto, Category>();
        CreateMap<CategoryUpdateDto, Category>();

        CreateMap<Engineer, EngineerReadDto>();
        CreateMap<Engineer, EngineerProfileDto>();
        CreateMap<Engineer, EngineerAdminReadDto>();
        CreateMap<EngineerCreateDto, Engineer>();
        CreateMap<EngineerUpdateDto, Engineer>();

        CreateMap<ProjectImage, ProjectImageReadDto>();
        CreateMap<Project, ProjectReadDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
            .ForMember(dest => dest.EngineerName, opt => opt.MapFrom(src => src.Engineer != null ? src.Engineer.FullName : string.Empty))
            .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => src.ProjectImages.OrderBy(x => x.DisplayOrder).Select(x => x.ImageUrl).ToList()));

        CreateMap<Project, ProjectDetailDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
            .ForMember(dest => dest.EngineerName, opt => opt.MapFrom(src => src.Engineer != null ? src.Engineer.FullName : string.Empty))
            .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => src.ProjectImages.OrderBy(x => x.DisplayOrder).Select(x => x.ImageUrl).ToList()));
        CreateMap<ProjectCreateDto, Project>();
        CreateMap<ProjectUpdateDto, Project>();
        CreateMap<ProjectImageCreateDto, ProjectImage>();

        CreateMap<ContactRequest, ContactRequestReadDto>();
        CreateMap<ContactRequestCreateDto, ContactRequest>();
    }
}
